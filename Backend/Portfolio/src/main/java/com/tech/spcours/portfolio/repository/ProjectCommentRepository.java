package com.tech.spcours.portfolio.repository;

import com.tech.spcours.portfolio.model.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
    List<ProjectComment> findByProject_IdOrderByCreatedAtDesc(Long projectId);

    List<ProjectComment> findByProject_IdAndApprovedTrueOrderByCreatedAtDesc(Long projectId);

    List<ProjectComment> findByApprovedFalseOrderByCreatedAtDesc();

    void deleteByProject_Id(Long projectId);
}
