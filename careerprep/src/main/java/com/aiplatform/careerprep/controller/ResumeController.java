package com.aiplatform.careerprep.controller;

import com.aiplatform.careerprep.dto.SubmitAnswersRequest;
import com.aiplatform.careerprep.entity.InterviewSession;
import com.aiplatform.careerprep.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/generate-interview")
    public InterviewSession generateInterview(
            @RequestParam("file") MultipartFile file,
            @RequestParam("interviewType") String interviewType,
            @RequestParam("difficulty") String difficulty,
            @RequestParam("numQuestions") int numQuestions
    ) throws Exception {
        return resumeService.generateInterview(file, interviewType, difficulty, numQuestions);
    }

    @PostMapping("/ats-score")
    public Map<String, Object> getAtsScore(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false) String jobDescription
    ) throws Exception {
        return resumeService.getAtsScore(file, jobDescription);
    }

    @PostMapping("/submit-answers")
    public InterviewSession submitAnswers(
            @RequestBody SubmitAnswersRequest request
    ) throws Exception {
        return resumeService.evaluateInterview(request);
    }

    @GetMapping("/history")
    public List<InterviewSession> getHistory() throws Exception {
        return resumeService.getHistory();
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() throws Exception {
        return resumeService.getDashboard();
    }
}