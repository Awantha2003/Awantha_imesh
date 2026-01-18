package com.tech.spcours.portfolio.controller;

import com.tech.spcours.portfolio.dto.ProjectCommentRequest;
import com.tech.spcours.portfolio.dto.ProjectCommentResponse;
import com.tech.spcours.portfolio.service.ProjectCommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/comments")
public class ProjectCommentController {
    private final ProjectCommentService commentService;

    public ProjectCommentController(ProjectCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectCommentResponse>> getComments(@PathVariable Long projectId) {
        return ResponseEntity.ok(commentService.getCommentsForProject(projectId));
    }

    @PostMapping
    public ResponseEntity<ProjectCommentResponse> createComment(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectCommentRequest request) {
        ProjectCommentResponse response = commentService.createComment(projectId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
