package com.tech.spcours.portfolio.service;

import com.tech.spcours.portfolio.dto.ProjectRequest;
import com.tech.spcours.portfolio.dto.ProjectResponse;
import com.tech.spcours.portfolio.model.Project;
import com.tech.spcours.portfolio.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDisplayDate(request.getDisplayDate());
        project.setPublic(Boolean.TRUE.equals(request.getIsPublic()));
        project.setImageUrl(request.getImageUrl());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setTechStack(request.getTechStack());
        project.setCategory(request.getCategory());
        project.setCountry(request.getCountry());
        project.setPinned(Boolean.TRUE.equals(request.getPinned()));

        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setDisplayDate(request.getDisplayDate());
        project.setPublic(Boolean.TRUE.equals(request.getIsPublic()));
        project.setImageUrl(request.getImageUrl());
        project.setGithubUrl(request.getGithubUrl());
        project.setLiveUrl(request.getLiveUrl());
        project.setTechStack(request.getTechStack());
        project.setCategory(request.getCategory());
        project.setCountry(request.getCountry());
        project.setPinned(Boolean.TRUE.equals(request.getPinned()));
        Project saved = projectRepository.save(project);
        return toResponse(saved);
    }

    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
        projectRepository.deleteById(id);
    }

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> getPublicProjects() {
        return projectRepository.findByIsPublicTrueOrderByPinnedDescIdDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse toResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setTitle(project.getTitle());
        response.setDescription(project.getDescription());
        response.setDisplayDate(project.getDisplayDate());
        response.setPublic(project.isPublic());
        response.setImageUrl(project.getImageUrl());
        response.setGithubUrl(project.getGithubUrl());
        response.setLiveUrl(project.getLiveUrl());
        response.setTechStack(project.getTechStack());
        response.setCategory(project.getCategory());
        response.setCountry(project.getCountry());
        response.setPinned(project.isPinned());
        return response;
    }
}
