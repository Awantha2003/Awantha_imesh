package com.tech.spcours.portfolio.service;

import com.tech.spcours.portfolio.dto.ProjectCommentAdminResponse;
import com.tech.spcours.portfolio.dto.ProjectCommentRequest;
import com.tech.spcours.portfolio.dto.ProjectCommentResponse;
import com.tech.spcours.portfolio.model.Project;
import com.tech.spcours.portfolio.model.ProjectComment;
import com.tech.spcours.portfolio.repository.ProjectCommentRepository;
import com.tech.spcours.portfolio.repository.ProjectRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectCommentService {
    private final ProjectCommentRepository commentRepository;
    private final ProjectRepository projectRepository;

    public ProjectCommentService(ProjectCommentRepository commentRepository, ProjectRepository projectRepository) {
        this.commentRepository = commentRepository;
        this.projectRepository = projectRepository;
    }

    public List<ProjectCommentResponse> getCommentsForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.isPublic()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
        return commentRepository.findByProject_IdAndApprovedTrueOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProjectCommentResponse createComment(Long projectId, ProjectCommentRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.isPublic()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
        ProjectComment comment = new ProjectComment();
        comment.setProject(project);
        comment.setName(request.getName().trim());
        comment.setMessage(request.getMessage().trim());
        comment.setApproved(false);
        if (StringUtils.hasText(request.getEmail())) {
            comment.setEmail(request.getEmail().trim());
        }
        return toResponse(commentRepository.save(comment));
    }

    public List<ProjectCommentAdminResponse> getPendingComments() {
        return commentRepository.findByApprovedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toAdminResponse)
                .collect(Collectors.toList());
    }

    public ProjectCommentAdminResponse approveComment(Long commentId) {
        ProjectComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        comment.setApproved(true);
        return toAdminResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long commentId) {
        ProjectComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        commentRepository.delete(comment);
    }

    private ProjectCommentResponse toResponse(ProjectComment comment) {
        ProjectCommentResponse response = new ProjectCommentResponse();
        response.setId(comment.getId());
        response.setProjectId(comment.getProject().getId());
        response.setName(comment.getName());
        response.setMessage(comment.getMessage());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }

    private ProjectCommentAdminResponse toAdminResponse(ProjectComment comment) {
        ProjectCommentAdminResponse response = new ProjectCommentAdminResponse();
        response.setId(comment.getId());
        response.setProjectId(comment.getProject().getId());
        response.setProjectTitle(comment.getProject().getTitle());
        response.setName(comment.getName());
        response.setEmail(comment.getEmail());
        response.setMessage(comment.getMessage());
        response.setCreatedAt(comment.getCreatedAt());
        response.setApproved(comment.isApproved());
        return response;
    }
}
