package com.aiplatform.careerprep.repository;

import com.aiplatform.careerprep.entity.InterviewSession;
import com.aiplatform.careerprep.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByUser(User user);
    List<InterviewSession> findByUserOrderByCreatedAtDesc(User user);
}
