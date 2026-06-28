package com.stratumiq.backend.modules.marketing.service;

import com.stratumiq.backend.common.enums.MarketingContentStatus;
import com.stratumiq.backend.entity.MarketingContent;
import com.stratumiq.backend.modules.marketing.dto.*;
import com.stratumiq.backend.modules.marketing.specification.MarketingSpecifications;
import com.stratumiq.backend.repository.MarketingContentRepository;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
public class MarketingService {

    private static final Logger log = LoggerFactory.getLogger(MarketingService.class);
    private static final int DASHBOARD_FEATURED_LIMIT = 5;

    private final MarketingContentRepository marketingRepo;

    public MarketingService(MarketingContentRepository marketingRepo) {
        this.marketingRepo = marketingRepo;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    @Transactional
    public MarketingResponse create(CreateMarketingRequest req, AuthenticatedUser actor) {
        MarketingContentStatus status = resolveStatus(req.getStatus(), req.getIsActive());

        List<MarketingContent> existing = new ArrayList<>(marketingRepo.findByDeletedAtIsNull());
        for (MarketingContent item : existing) {
            item.setSortOrder(item.getSortOrder() + 1);
        }
        marketingRepo.saveAll(existing);

        Instant now = Instant.now();
        MarketingContent content = MarketingContent.builder()
            .type(req.getType())
            .title(req.getTitle())
            .subtitle(req.getSubtitle())
            .body(req.getBody())
            .richContent(req.getRichContent())
            .imageUrl(req.getImageUrl())
            .thumbnailUrl(req.getThumbnailUrl())
            .ctaText(req.getCtaText())
            .ctaUrl(req.getCtaUrl())
            .status(status)
            .isActive(status == MarketingContentStatus.PUBLISHED)
            .isPinned(Boolean.TRUE.equals(req.getIsPinned()))
            .priority(req.getPriority() != null ? req.getPriority() : 0)
            .tags(req.getTags())
            .startsAt(req.getStartsAt())
            .endsAt(req.getEndsAt())
            .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 1)
            .createdBy(actorId(actor))
            .updatedBy(actorId(actor))
            .createdAt(now)
            .updatedAt(now)
            .build();

        MarketingContent saved = marketingRepo.save(content);
        persistPriorityNormalization(saved);
        log.info("Marketing content created id={} by user={}", saved.getId(), actorId(actor));
        return toResponse(saved);
    }

    // ─── List (paginated) ─────────────────────────────────────────────────────

    public Map<String, Object> list(
            String search, String status, String type, Boolean pinned,
            boolean includeArchived, String sortBy, String sortDir,
            int page, int limit
    ) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir)
            ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = resolveSortField(sortBy);

        PageRequest pageable = PageRequest.of(safePage - 1, safeLimit, Sort.by(direction, sortField));
        var spec = MarketingSpecifications.filter(search, status, type, pinned, includeArchived);
        Page<MarketingContent> result = marketingRepo.findAll(spec, pageable);

        List<MarketingResponse> items = result.getContent().stream()
            .map(this::toResponse)
            .toList();

        return Map.of(
            "marketing", items,
            "pagination", Map.of(
                "page", safePage,
                "limit", safeLimit,
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            )
        );
    }

    /** Legacy list-all endpoint — returns paginated first page for backward compatibility */
    public Map<String, Object> listAllLegacy() {
        return list("", "all", "all", null, true, "sortOrder", "asc", 1, 500);
    }

    // ─── Dashboard (user-facing) ──────────────────────────────────────────────

    public List<MarketingResponse> getDashboardMarketing() {
        return marketingRepo
            .findDashboardFeatured(Instant.now(), PageRequest.of(0, DASHBOARD_FEATURED_LIMIT))
            .stream()
            .map(this::toResponse)
            .toList();
    }

    public MarketingKpiResponse getKpis() {
        List<MarketingContent> items = marketingRepo.findByDeletedAtIsNull();
        Instant now = Instant.now();
        long published = items.stream().filter(i -> i.getStatus() == MarketingContentStatus.PUBLISHED).count();
        long drafts = items.stream().filter(i -> i.getStatus() == MarketingContentStatus.DRAFT).count();
        long archived = items.stream().filter(i -> i.getStatus() == MarketingContentStatus.ARCHIVED).count();
        long pinned = items.stream().filter(Boolean.TRUE::equals).map(MarketingContent::getIsPinned).count();
        long scheduled = items.stream().filter(i -> i.getStartsAt() != null && i.getStartsAt().isAfter(now)).count();
        long expired = items.stream().filter(i -> i.getEndsAt() != null && i.getEndsAt().isBefore(now)).count();
        long totalViews = 0L;
        long totalClicks = 0L;
        double ctr = totalViews == 0 ? 0.0 : ((double) totalClicks / (double) totalViews) * 100.0;

        return MarketingKpiResponse.builder()
            .totalNews(items.size())
            .published(published)
            .drafts(drafts)
            .archived(archived)
            .pinned(pinned)
            .scheduled(scheduled)
            .expired(expired)
            .totalViews(totalViews)
            .totalClicks(totalClicks)
            .ctr(ctr)
            .build();
    }

    public Map<String, Object> getAllPublishedMarketing(int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 50);
        PageRequest pageable = PageRequest.of(safePage - 1, safeLimit);

        List<MarketingContent> items = marketingRepo.findAllPublishedActive(Instant.now(), pageable);
        long total = marketingRepo.countPublishedActive(Instant.now());

        List<MarketingResponse> responses = items.stream().map(this::toResponse).toList();

        return Map.of(
            "marketing", responses,
            "pagination", Map.of(
                "page", safePage,
                "limit", safeLimit,
                "total", total,
                "totalPages", (int) Math.ceil((double) total / safeLimit)
            )
        );
    }

    // ─── Get by id ────────────────────────────────────────────────────────────

    public MarketingResponse getById(Long id) {
        return toResponse(findActive(id));
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    @Transactional
    public MarketingResponse update(Long id, UpdateMarketingRequest req, AuthenticatedUser actor) {
        MarketingContent content = findActive(id);
        applyUpdate(content, req);
        content.setUpdatedBy(actorId(actor));
        content.setUpdatedAt(Instant.now());
        syncActiveFlag(content);
        MarketingContent saved = marketingRepo.save(content);
        persistPriorityNormalization(saved);
        return toResponse(saved);
    }

    // ─── Status ───────────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    @Transactional
    public MarketingResponse updateStatus(Long id, UpdateMarketingStatusRequest req, AuthenticatedUser actor) {
        MarketingContent content = findActive(id);

        if (req.getStatus() != null) {
            content.setStatus(req.getStatus());
        } else if (req.getIsActive() != null) {
            content.setStatus(req.getIsActive()
                ? MarketingContentStatus.PUBLISHED
                : MarketingContentStatus.DRAFT);
        }

        if (req.getIsPinned() != null) {
            content.setIsPinned(req.getIsPinned());
        }

        content.setUpdatedBy(actorId(actor));
        content.setUpdatedAt(Instant.now());
        syncActiveFlag(content);
        MarketingContent saved = marketingRepo.save(content);
        persistPriorityNormalization(saved);
        return toResponse(saved);
    }

    // ─── Archive / Restore / Duplicate ────────────────────────────────────────

    @SuppressWarnings("null")
    @Transactional
    public MarketingResponse archive(Long id, AuthenticatedUser actor) {
        MarketingContent content = findActive(id);
        content.setStatus(MarketingContentStatus.ARCHIVED);
        content.setIsActive(false);
        content.setUpdatedBy(actorId(actor));
        content.setUpdatedAt(Instant.now());
        MarketingContent saved = marketingRepo.save(content);
        persistPriorityNormalization(saved);
        log.info("Marketing content archived id={}", id);
        return toResponse(saved);
    }

    @SuppressWarnings("null")
    @Transactional
    public MarketingResponse restore(Long id, AuthenticatedUser actor) {
        MarketingContent content = findByIdOrThrow(id);
        if (content.getDeletedAt() != null) {
            content.setDeletedAt(null);
        }
        content.setStatus(MarketingContentStatus.DRAFT);
        content.setIsActive(false);
        content.setUpdatedBy(actorId(actor));
        content.setUpdatedAt(Instant.now());
        MarketingContent saved = marketingRepo.save(Objects.requireNonNull(content, "content must not be null"));
        persistPriorityNormalization(saved);
        log.info("Marketing content restored id={}", id);
        return toResponse(saved);
    }

    @SuppressWarnings("null")
    @Transactional
    public MarketingResponse duplicate(Long id, AuthenticatedUser actor) {
        MarketingContent source = findActive(id);
        Instant now = Instant.now();

        MarketingContent copy = MarketingContent.builder()
            .type(source.getType())
            .title(source.getTitle() + " (Copy)")
            .subtitle(source.getSubtitle())
            .body(source.getBody())
            .richContent(source.getRichContent())
            .imageUrl(source.getImageUrl())
            .thumbnailUrl(source.getThumbnailUrl())
            .ctaText(source.getCtaText())
            .ctaUrl(source.getCtaUrl())
            .status(MarketingContentStatus.DRAFT)
            .isActive(false)
            .isPinned(false)
            .priority(source.getPriority())
            .tags(source.getTags())
            .startsAt(null)
            .endsAt(null)
            .sortOrder(1)
            .createdBy(actorId(actor))
            .updatedBy(actorId(actor))
            .createdAt(now)
            .updatedAt(now)
            .build();

        List<MarketingContent> existing = new ArrayList<>(marketingRepo.findByDeletedAtIsNull());
        for (MarketingContent item : existing) {
            item.setSortOrder(item.getSortOrder() + 1);
        }
        marketingRepo.saveAll(Objects.requireNonNull(existing, "existing marketing items must not be null"));

        MarketingContent saved = marketingRepo.save(Objects.requireNonNull(copy, "copy must not be null"));
        persistPriorityNormalization(saved);
        log.info("Marketing content duplicated source={} new={}", id, saved.getId());
        return toResponse(saved);
    }

    // ─── Delete (soft) ────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    @Transactional
    public void delete(Long id, AuthenticatedUser actor) {
        MarketingContent content = findByIdOrThrow(id);
        content.setDeletedAt(Instant.now());
        content.setStatus(MarketingContentStatus.ARCHIVED);
        content.setIsActive(false);
        content.setUpdatedBy(actorId(actor));
        content.setUpdatedAt(Instant.now());
        marketingRepo.save(Objects.requireNonNull(content, "content must not be null"));
        persistPriorityNormalization();
        log.info("Marketing content soft-deleted id={}", id);
    }

    // ─── Bulk actions ─────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    @Transactional
    public Map<String, Object> bulkAction(BulkMarketingRequest req, AuthenticatedUser actor) {
        int affected = 0;
        Instant now = Instant.now();

        for (Long id : req.getIds()) {
            Long safeId = Objects.requireNonNull(id, "id must not be null");
            MarketingContent content = marketingRepo.findById(safeId).orElse(null);
            if (content == null || content.getDeletedAt() != null) continue;

            switch (req.getAction()) {
                case PUBLISH -> {
                    content.setStatus(MarketingContentStatus.PUBLISHED);
                    content.setIsActive(true);
                }
                case UNPUBLISH -> {
                    content.setStatus(MarketingContentStatus.DRAFT);
                    content.setIsActive(false);
                }
                case ARCHIVE -> {
                    content.setStatus(MarketingContentStatus.ARCHIVED);
                    content.setIsActive(false);
                }
                case DELETE -> {
                    content.setDeletedAt(now);
                    content.setStatus(MarketingContentStatus.ARCHIVED);
                    content.setIsActive(false);
                }
            }
            content.setUpdatedBy(actorId(actor));
            content.setUpdatedAt(now);
            marketingRepo.save(Objects.requireNonNull(content, "content must not be null"));
            affected++;
        }

        log.info("Bulk marketing action={} affected={} by user={}",
            req.getAction(), affected, actorId(actor));
        persistPriorityNormalization();

        return Map.of("affected", affected, "action", req.getAction().name());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private MarketingContent findActive(Long id) {
        MarketingContent content = findByIdOrThrow(id);
        if (content.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Marketing content not found");
        }
        return content;
    }

    private MarketingContent findByIdOrThrow(Long id) {
        Long safeId = Objects.requireNonNull(id, "id must not be null");
        return marketingRepo.findById(safeId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Marketing content not found"));
    }

    private void applyUpdate(MarketingContent content, UpdateMarketingRequest req) {
        if (req.getType()         != null) content.setType(req.getType());
        if (req.getTitle()        != null) content.setTitle(req.getTitle());
        if (req.getSubtitle()     != null) content.setSubtitle(req.getSubtitle());
        if (req.getBody()         != null) content.setBody(req.getBody());
        if (req.getRichContent()  != null) content.setRichContent(req.getRichContent());
        if (req.getImageUrl()     != null) content.setImageUrl(req.getImageUrl());
        if (req.getThumbnailUrl() != null) content.setThumbnailUrl(req.getThumbnailUrl());
        if (req.getCtaText()      != null) content.setCtaText(req.getCtaText());
        if (req.getCtaUrl()       != null) content.setCtaUrl(req.getCtaUrl());
        if (req.getStatus()       != null) content.setStatus(req.getStatus());
        if (req.getIsPinned()     != null) content.setIsPinned(req.getIsPinned());
        if (req.getPriority()     != null) content.setPriority(req.getPriority());
        if (req.getTags()         != null) content.setTags(req.getTags());
        if (req.getStartsAt()     != null) content.setStartsAt(req.getStartsAt());
        if (req.getEndsAt()       != null) content.setEndsAt(req.getEndsAt());
        if (req.getSortOrder()    != null) content.setSortOrder(req.getSortOrder());
        if (req.getIsActive()     != null && req.getStatus() == null) {
            content.setStatus(req.getIsActive()
                ? MarketingContentStatus.PUBLISHED
                : MarketingContentStatus.DRAFT);
        }
    }

    private void syncActiveFlag(MarketingContent content) {
        content.setIsActive(content.getStatus() == MarketingContentStatus.PUBLISHED);
    }

    private MarketingContentStatus resolveStatus(MarketingContentStatus status, Boolean isActive) {
        if (status != null) return status;
        if (Boolean.TRUE.equals(isActive)) return MarketingContentStatus.PUBLISHED;
        return MarketingContentStatus.DRAFT;
    }

    private String resolveSortField(String sortBy) {
        return switch (sortBy != null ? sortBy : "") {
            case "title"     -> "title";
            case "priority"  -> "priority";
            case "status"    -> "status";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            default          -> "sortOrder";
        };
    }

    static void normalizePriorities(List<MarketingContent> items) {
        if (items == null || items.isEmpty()) return;

        Set<Integer> assigned = new HashSet<>();
        List<MarketingContent> sorted = items.stream()
            .filter(item -> item != null)
            .sorted((a, b) -> {
                int byOrder = Integer.compare(
                    a.getSortOrder() != null ? a.getSortOrder() : 0,
                    b.getSortOrder() != null ? b.getSortOrder() : 0
                );
                if (byOrder != 0) return byOrder;
                int byCreated = Long.compare(
                    a.getCreatedAt() != null ? a.getCreatedAt().toEpochMilli() : 0L,
                    b.getCreatedAt() != null ? b.getCreatedAt().toEpochMilli() : 0L
                );
                return byCreated != 0 ? byCreated : Long.compare(
                    a.getId() != null ? a.getId() : 0L,
                    b.getId() != null ? b.getId() : 0L
                );
            })
            .toList();

        for (MarketingContent item : sorted) {
            int candidate = item.getPriority() != null ? item.getPriority() : 0;
            while (assigned.contains(candidate)) {
                candidate++;
            }
            item.setPriority(candidate);
            assigned.add(candidate);
        }
    }

    private void persistPriorityNormalization(MarketingContent... changedItems) {
        List<MarketingContent> all = new ArrayList<>(marketingRepo.findByDeletedAtIsNull());
        for (MarketingContent changed : changedItems) {
            if (changed == null) continue;
            boolean exists = all.stream().anyMatch(existing -> existing.getId() != null && existing.getId().equals(changed.getId()));
            if (!exists) {
                all.add(changed);
            }
        }
        normalizePriorities(all);
        marketingRepo.saveAll(Objects.requireNonNull(all, "all marketing items must not be null"));
    }

    private Long actorId(AuthenticatedUser actor) {
        return actor != null ? actor.userId() : null;
    }

    private MarketingResponse toResponse(MarketingContent content) {
        return MarketingResponse.builder()
            .id(content.getId())
            .type(content.getType())
            .title(content.getTitle())
            .subtitle(content.getSubtitle())
            .body(content.getBody())
            .richContent(content.getRichContent())
            .imageUrl(content.getImageUrl())
            .thumbnailUrl(content.getThumbnailUrl())
            .ctaText(content.getCtaText())
            .ctaUrl(content.getCtaUrl())
            .isActive(content.getIsActive())
            .status(content.getStatus())
            .isPinned(content.getIsPinned())
            .priority(content.getPriority())
            .tags(content.getTags())
            .startsAt(content.getStartsAt())
            .endsAt(content.getEndsAt())
            .sortOrder(content.getSortOrder())
            .createdBy(content.getCreatedBy())
            .updatedBy(content.getUpdatedBy())
            .createdAt(content.getCreatedAt())
            .updatedAt(content.getUpdatedAt())
            .build();
    }
}
