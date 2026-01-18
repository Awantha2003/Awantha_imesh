package com.tech.spcours.portfolio.controller;

import com.tech.spcours.portfolio.dto.ProjectCommentAdminResponse;
import com.tech.spcours.portfolio.service.ProjectCommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/project-comments")
public class AdminProjectCommentController {
    private final ProjectCommentService commentService;

    public AdminProjectCommentController(ProjectCommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ProjectCommentAdminResponse>> getPendingComments() {
        return ResponseEntity.ok(commentService.getPendingComments());
    }

    @PutMapping("/{commentId}/approve")
    public ResponseEntity<ProjectCommentAdminResponse> approveComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentService.approveComment(commentId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
