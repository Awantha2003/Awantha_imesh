package com.tech.spcours.portfolio.repository;

import com.tech.spcours.portfolio.model.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    List<SocialLink> findByActiveTrueOrderBySortOrderAscIdAsc();
    List<SocialLink> findAllByOrderBySortOrderAscIdAsc();
}
