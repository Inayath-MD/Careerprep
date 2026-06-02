package com.aiplatform.careerprep.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class SubmitAnswersRequest {
    private Long sessionId;
    private List<AnswerSubmission> answers;
}
