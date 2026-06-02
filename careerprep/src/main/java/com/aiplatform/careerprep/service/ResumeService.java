package com.aiplatform.careerprep.service;

import com.aiplatform.careerprep.dto.AnswerSubmission;
import com.aiplatform.careerprep.dto.SubmitAnswersRequest;
import com.aiplatform.careerprep.entity.InterviewQuestion;
import com.aiplatform.careerprep.entity.InterviewSession;
import com.aiplatform.careerprep.entity.User;
import com.aiplatform.careerprep.repository.InterviewQuestionRepository;
import com.aiplatform.careerprep.repository.InterviewSessionRepository;
import com.aiplatform.careerprep.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final UserRepository userRepository;
    private final InterviewSessionRepository sessionRepository;
    private final InterviewQuestionRepository questionRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${ai.fastapi.url}")
    private String fastApiUrl;

    public InterviewSession generateInterview(
            MultipartFile file,
            String interviewType,
            String difficulty,
            int numQuestions
    ) throws Exception {
        // 1. Get logged-in user
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // 2. Call FastAPI /generate-interview
        String url = fastApiUrl + "/generate-interview";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", fileResource);
        body.add("interview_type", interviewType);
        body.add("difficulty", difficulty);
        body.add("num_questions", numQuestions);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        // 3. Parse and Save Interview Session
        JsonNode root = objectMapper.readTree(response.getBody());
        if (!root.path("success").asBoolean()) {
            throw new RuntimeException("AI Question Generation Failed: " + root.path("error").asText());
        }

        InterviewSession session = InterviewSession.builder()
                .user(user)
                .interviewType(interviewType)
                .difficulty(difficulty)
                .questions(new ArrayList<>())
                .build();

        session = sessionRepository.save(session);

        JsonNode questionsNode = root.path("questions");
        List<InterviewQuestion> questionsList = new ArrayList<>();
        if (questionsNode.isArray()) {
            for (JsonNode qNode : questionsNode) {
                InterviewQuestion question = InterviewQuestion.builder()
                        .interviewSession(session)
                        .questionText(qNode.path("question").asText())
                        .build();
                questionsList.add(questionRepository.save(question));
            }
        }

        session.setQuestions(questionsList);
        return session;
    }

    public Map<String, Object> getAtsScore(MultipartFile file, String jobDescription) throws Exception {
        String url = fastApiUrl + "/ats-score";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        };
        body.add("file", fileResource);
        if (jobDescription != null && !jobDescription.trim().isEmpty()) {
            body.add("job_description", jobDescription);
        }

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        return objectMapper.readValue(response.getBody(), Map.class);
    }

    public InterviewSession evaluateInterview(SubmitAnswersRequest request) throws Exception {
        // 1. Fetch Session
        InterviewSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        // 2. Map candidate answers to questions
        Map<Long, String> answerMap = new HashMap<>();
        for (AnswerSubmission ans : request.getAnswers()) {
            answerMap.put(ans.getQuestionId(), ans.getAnswer());
        }

        List<Map<String, String>> pythonPayloadList = new ArrayList<>();
        for (InterviewQuestion question : session.getQuestions()) {
            String candidateAnswer = answerMap.getOrDefault(question.getId(), "");
            question.setCandidateAnswer(candidateAnswer);

            Map<String, String> pythonResponseItem = new HashMap<>();
            pythonResponseItem.put("question", question.getQuestionText());
            pythonResponseItem.put("answer", candidateAnswer);
            pythonPayloadList.add(pythonResponseItem);
        }

        // 3. Send to Python for evaluation
        String url = fastApiUrl + "/evaluate-interview";
        Map<String, Object> payload = new HashMap<>();
        payload.put("responses", pythonPayloadList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

        // 4. Parse Python Response
        JsonNode root = objectMapper.readTree(response.getBody());

        // We expect structured JSON: overall_score, overall_feedback, question_evaluations
        session.setOverallScore(root.path("overall_score").asDouble());
        session.setOverallFeedback(root.path("overall_feedback").asText());

        JsonNode qEvals = root.path("question_evaluations");
        if (qEvals.isArray()) {
            for (int i = 0; i < qEvals.size() && i < session.getQuestions().size(); i++) {
                JsonNode qEval = qEvals.get(i);
                InterviewQuestion question = session.getQuestions().get(i);
                question.setScore(qEval.path("score").asInt());
                question.setFeedback(qEval.path("feedback").asText());
                question.setCorrectAnswer(qEval.path("correct_answer").asText());
                questionRepository.save(question);
            }
        }

        return sessionRepository.save(session);
    }

    public List<InterviewSession> getHistory() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        return sessionRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Map<String, Object> getDashboard() throws Exception {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        List<InterviewSession> sessions = sessionRepository.findByUserOrderByCreatedAtDesc(user);

        int totalInterviews = sessions.size();
        double sumScore = 0;
        int evaluatedSessionsCount = 0;
        double highestScore = 0;
        List<String> weakTopics = new ArrayList<>();
        String primaryRole = "Developer";

        for (InterviewSession session : sessions) {
            if (session.getOverallScore() != null) {
                sumScore += session.getOverallScore();
                evaluatedSessionsCount++;
                if (session.getOverallScore() > highestScore) {
                    highestScore = session.getOverallScore();
                }
            }
            if (session.getInterviewType() != null) {
                primaryRole = session.getInterviewType();
            }

            if (session.getQuestions() != null) {
                for (InterviewQuestion q : session.getQuestions()) {
                    if (q.getScore() != null && q.getScore() < 7) {
                        weakTopics.add(q.getQuestionText());
                    }
                }
            }
        }

        double averageScore = evaluatedSessionsCount > 0 ? (sumScore / evaluatedSessionsCount) : 0.0;

        String url = fastApiUrl + "/generate-roadmap";
        Map<String, Object> payload = new HashMap<>();
        payload.put("weak_topics", weakTopics);
        payload.put("role", primaryRole);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(payload, headers);
        
        JsonNode roadmapNode = null;
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            roadmapNode = objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            System.err.println("Could not generate AI roadmap: " + e.getMessage());
        }

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalInterviews", totalInterviews);
        dashboard.put("averageScore", Math.round(averageScore * 100.0) / 100.0);
        dashboard.put("highestScore", highestScore);
        dashboard.put("weakTopicsCount", weakTopics.size());
        dashboard.put("weakTopicsList", weakTopics);
        dashboard.put("aiRoadmap", roadmapNode);

        return dashboard;
    }
}