package com.stratumiq.backend.modules.marketing.service;

import com.stratumiq.backend.entity.MarketingContent;
import com.stratumiq.backend.modules.marketing.dto.CreateMarketingRequest;
import com.stratumiq.backend.modules.marketing.dto.MarketingResponse;
import com.stratumiq.backend.repository.MarketingContentRepository;
import com.stratumiq.backend.modules.marketing.dto.UpdateMarketingRequest;
import com.stratumiq.backend.modules.marketing.dto.UpdateMarketingStatusRequest;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class MarketingService {

    private final MarketingContentRepository marketingRepo;

    public MarketingService(MarketingContentRepository marketingRepo) {
        this.marketingRepo = marketingRepo;
    }

    @Transactional
    public MarketingResponse create(CreateMarketingRequest req) {

        MarketingContent content = MarketingContent.builder()
            .type(req.getType())
            .title(req.getTitle())
            .body(req.getBody())
            .imageUrl(req.getImageUrl())
            .ctaUrl(req.getCtaUrl())
            .isActive(req.getIsActive() != null ? req.getIsActive() : false)
            .startsAt(req.getStartsAt())
            .endsAt(req.getEndsAt())
            .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        return toResponse(marketingRepo.save(content));
    }

    public Map<String, Object> listAll() {

        List<MarketingResponse> items = marketingRepo.findAll(
                Sort.by(Sort.Direction.ASC, "sortOrder")
        )
        .stream()
        .filter(item -> item.getDeletedAt() == null)
        .map(this::toResponse)
        .toList();

        return Map.of(
            "marketing", items,
            "total", items.size()
        );
    }

    public List<MarketingResponse> getDashboardMarketing() {

    Instant now = Instant.now();

    return marketingRepo
            .findActiveDashboardContent(now,PageRequest.of(0, 5))
            .stream()
            .map(this::toResponse)
            .toList();
}

    public MarketingResponse getById(Long id) {

        MarketingContent content = marketingRepo.findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Marketing content not found"
                ));

        if (content.getDeletedAt() != null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Marketing content not found"
            );
        }

        return toResponse(content);
    }

@Transactional
public MarketingResponse update(
        Long id,
        UpdateMarketingRequest req
) {

    MarketingContent content = marketingRepo.findById(id)
        .orElseThrow(() ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Marketing content not found"
            ));

    if (content.getDeletedAt() != null) {
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Marketing content not found"
        );
    }

    if (req.getType() != null) {
        content.setType(req.getType());
    }

    if (req.getTitle() != null) {
        content.setTitle(req.getTitle());
    }

    if (req.getBody() != null) {
        content.setBody(req.getBody());
    }

    if (req.getImageUrl() != null) {
        content.setImageUrl(req.getImageUrl());
    }

    if (req.getCtaUrl() != null) {
        content.setCtaUrl(req.getCtaUrl());
    }

    if (req.getIsActive() != null) {
        content.setIsActive(req.getIsActive());
    }

    if (req.getStartsAt() != null) {
        content.setStartsAt(req.getStartsAt());
    }

    if (req.getEndsAt() != null) {
        content.setEndsAt(req.getEndsAt());
    }

    if (req.getSortOrder() != null) {
        content.setSortOrder(req.getSortOrder());
    }

    content.setUpdatedAt(Instant.now());

    return toResponse(
        marketingRepo.save(content)
    );
}


@Transactional
public MarketingResponse updateStatus(
        Long id,
        UpdateMarketingStatusRequest req
) {

    MarketingContent content = marketingRepo.findById(id)
        .orElseThrow(() ->
            new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Marketing content not found"
            ));

    if (content.getDeletedAt() != null) {
        throw new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Marketing content not found"
        );
    }

    content.setIsActive(req.getIsActive());
    content.setUpdatedAt(Instant.now());

    return toResponse(
        marketingRepo.save(content)
    );
}

    @Transactional
    public void delete(Long id) {

        MarketingContent content = marketingRepo.findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Marketing content not found"
                ));

        content.setDeletedAt(Instant.now());

        marketingRepo.save(content);
    }

    private MarketingResponse toResponse(MarketingContent content) {

        return MarketingResponse.builder()
            .id(content.getId())
            .type(content.getType())
            .title(content.getTitle())
            .body(content.getBody())
            .imageUrl(content.getImageUrl())
            .ctaUrl(content.getCtaUrl())
            .isActive(content.getIsActive())
            .startsAt(content.getStartsAt())
            .endsAt(content.getEndsAt())
            .sortOrder(content.getSortOrder())
            .createdAt(content.getCreatedAt())
            .updatedAt(content.getUpdatedAt())
            .build();
    }
}