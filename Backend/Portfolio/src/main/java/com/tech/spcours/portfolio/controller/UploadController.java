package com.tech.spcours.portfolio.controller;

import com.tech.spcours.portfolio.dto.UploadResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {
    private static final Path UPLOAD_ROOT = Path.of("uploads", "projects");

    @PostMapping(path = "/project-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> uploadProjectImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Files.createDirectories(UPLOAD_ROOT);

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String extension = "";
        int dotIndex = original.lastIndexOf('.');
        if (dotIndex > -1 && dotIndex < original.length() - 1) {
            extension = original.substring(dotIndex);
        }

        String fileName = UUID.randomUUID() + extension;
        Path target = UPLOAD_ROOT.resolve(fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        String url = "/uploads/projects/" + fileName;
        return new ResponseEntity<>(new UploadResponse(url), HttpStatus.CREATED);
    }
}
