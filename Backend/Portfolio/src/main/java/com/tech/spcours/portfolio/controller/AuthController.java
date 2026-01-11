package com.tech.spcours.portfolio.controller;

import com.tech.spcours.portfolio.dto.AuthProfileResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @GetMapping("/me")
    public ResponseEntity<AuthProfileResponse> getProfile(Authentication authentication) {
        AuthProfileResponse response = new AuthProfileResponse();
        response.setEmail(authentication.getName());
        response.setRole(authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority())
                .orElse("ROLE_ADMIN"));
        return ResponseEntity.ok(response);
    }
}
