package com.tech.spcours.portfolio.service;

import com.tech.spcours.portfolio.dto.SocialLinkRequest;
import com.tech.spcours.portfolio.dto.SocialLinkResponse;
import com.tech.spcours.portfolio.model.SocialLink;
import com.tech.spcours.portfolio.repository.SocialLinkRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SocialLinkService {
    private final SocialLinkRepository socialLinkRepository;

    public SocialLinkService(SocialLinkRepository socialLinkRepository) {
        this.socialLinkRepository = socialLinkRepository;
    }

    public List<SocialLinkResponse> getActiveLinks() {
        return socialLinkRepository.findByActiveTrueOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SocialLinkResponse> getAllLinks() {
        return socialLinkRepository.findAllByOrderBySortOrderAscIdAsc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SocialLinkResponse createLink(SocialLinkRequest request) {
        SocialLink link = new SocialLink();
        applyRequest(link, request);
        return toResponse(socialLinkRepository.save(link));
    }

    public SocialLinkResponse updateLink(Long id, SocialLinkRequest request) {
        SocialLink link = socialLinkRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Social link not found"));
        applyRequest(link, request);
        return toResponse(socialLinkRepository.save(link));
    }

    public void deleteLink(Long id) {
        if (!socialLinkRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Social link not found");
        }
        socialLinkRepository.deleteById(id);
    }

    private void applyRequest(SocialLink link, SocialLinkRequest request) {
        link.setPlatform(request.getPlatform());
        link.setUrl(request.getUrl());
        link.setLabel(request.getLabel());
        link.setIconKey(request.getIconKey());
        link.setSortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder());
        link.setActive(request.getActive() == null || request.getActive());
    }

    private SocialLinkResponse toResponse(SocialLink link) {
        SocialLinkResponse response = new SocialLinkResponse();
        response.setId(link.getId());
        response.setPlatform(link.getPlatform());
        response.setUrl(link.getUrl());
        response.setLabel(link.getLabel());
        response.setIconKey(link.getIconKey());
        response.setSortOrder(link.getSortOrder());
        response.setActive(link.isActive());
        return response;
    }
}
