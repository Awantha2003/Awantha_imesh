package com.tech.spcours.portfolio.controller;

import com.tech.spcours.portfolio.dto.SocialLinkRequest;
import com.tech.spcours.portfolio.dto.SocialLinkResponse;
import com.tech.spcours.portfolio.service.SocialLinkService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/social-links")
public class SocialLinkController {
    private final SocialLinkService socialLinkService;

    public SocialLinkController(SocialLinkService socialLinkService) {
        this.socialLinkService = socialLinkService;
    }

    @GetMapping
    public ResponseEntity<List<SocialLinkResponse>> getActiveLinks() {
        return ResponseEntity.ok(socialLinkService.getActiveLinks());
    }

    @GetMapping("/all")
    public ResponseEntity<List<SocialLinkResponse>> getAllLinks() {
        return ResponseEntity.ok(socialLinkService.getAllLinks());
    }

    @PostMapping
    public ResponseEntity<SocialLinkResponse> createLink(@Valid @RequestBody SocialLinkRequest request) {
        return new ResponseEntity<>(socialLinkService.createLink(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SocialLinkResponse> updateLink(@PathVariable Long id, @Valid @RequestBody SocialLinkRequest request) {
        return ResponseEntity.ok(socialLinkService.updateLink(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable Long id) {
        socialLinkService.deleteLink(id);
        return ResponseEntity.noContent().build();
    }
}
