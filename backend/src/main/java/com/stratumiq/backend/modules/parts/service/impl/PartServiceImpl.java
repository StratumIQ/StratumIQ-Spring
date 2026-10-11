package com.stratumiq.backend.modules.parts.service.impl;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.common.enums.SupportType;
import com.stratumiq.backend.common.enums.TicketPriority;
import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.modules.parts.dto.*;
import com.stratumiq.backend.modules.parts.mapper.PartMapper;
import com.stratumiq.backend.modules.parts.service.PartService;
import com.stratumiq.backend.modules.parts.specification.PartSpecifications;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketRequest;
import com.stratumiq.backend.modules.support.dto.SupportTicketResponse;
import com.stratumiq.backend.modules.support.service.SupportTicketService;
import com.stratumiq.backend.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@Transactional
public class PartServiceImpl implements PartService {

    private final PartRepository partRepository;
    private final PartCategoryRepository partCategoryRepository;
    private final PartBrandRepository partBrandRepository;
    private final ManufacturerRepository manufacturerRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final PartImageRepository partImageRepository;
    private final UserRepository userRepository;
    private final SupportTicketService supportTicketService;
    private final PartMapper partMapper;

    public PartServiceImpl(
            PartRepository partRepository,
            PartCategoryRepository partCategoryRepository,
            PartBrandRepository partBrandRepository,
            ManufacturerRepository manufacturerRepository,
            UnitOfMeasureRepository unitOfMeasureRepository,
            PartImageRepository partImageRepository,
            UserRepository userRepository,
            SupportTicketService supportTicketService,
            PartMapper partMapper
    ) {
        this.partRepository = partRepository;
        this.partCategoryRepository = partCategoryRepository;
        this.partBrandRepository = partBrandRepository;
        this.manufacturerRepository = manufacturerRepository;
        this.unitOfMeasureRepository = unitOfMeasureRepository;
        this.partImageRepository = partImageRepository;
        this.userRepository = userRepository;
        this.supportTicketService = supportTicketService;
        this.partMapper = partMapper;
    }

    @Override
    public PartResponse create(Long dealerId, Long createdBy, CreatePartRequest request) {
        Objects.requireNonNull(dealerId, "Dealer id is required.");
        Objects.requireNonNull(createdBy, "Created by is required.");
        Objects.requireNonNull(request, "Create part request is required.");

        if (partRepository.existsByPartNumber(request.getPartNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Part number already exists.");
        }
        if (request.getSku() != null && !request.getSku().isBlank()
                && partRepository.existsBySkuIgnoreCase(request.getSku().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists.");
        }

        PartCategory category = requireCategory(request.getCategoryId());
        PartBrand brand = optionalBrand(request.getBrandId());
        Manufacturer manufacturer = optionalManufacturer(request.getManufacturerId());
        UnitOfMeasure unitOfMeasure = requireUnit(request.getUnitOfMeasureId());

        Part part = partMapper.toEntity(
                request, dealerId, createdBy, category, brand, manufacturer, unitOfMeasure);
        partMapper.replaceImages(part, request.getImages());
        partMapper.replaceAttributes(part, request.getAttributes());

        Part saved = partRepository.save(part);
        saved.setSeoSlug(uniqueSlug(partMapper.generateSlug(saved.getPartName()), saved.getId()));
        saved = partRepository.save(saved);
        return toResponse(saved);
    }

    @Override
    public PartResponse update(Long partId, Long actorUserId, boolean admin, UpdatePartRequest request) {
        Part part = requirePart(partId);
        assertCanManage(part, actorUserId, admin);

        if (request.getSku() != null && !request.getSku().isBlank()
                && partRepository.existsBySkuIgnoreCaseAndIdNot(request.getSku().trim(), part.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists.");
        }

        PartCategory category = request.getCategoryId() == null
                ? part.getCategory()
                : requireCategory(request.getCategoryId());
        PartBrand brand = request.getBrandId() == null
                ? part.getBrand()
                : optionalBrand(request.getBrandId());
        Manufacturer manufacturer = request.getManufacturerId() == null
                ? part.getManufacturer()
                : optionalManufacturer(request.getManufacturerId());
        UnitOfMeasure unitOfMeasure = request.getUnitOfMeasureId() == null
                ? part.getUnitOfMeasure()
                : requireUnit(request.getUnitOfMeasureId());

        partMapper.updateEntity(part, request, category, brand, manufacturer, unitOfMeasure);
        if (request.getImages() != null) {
            partMapper.replaceImages(part, request.getImages());
        }
        if (request.getAttributes() != null) {
            partMapper.replaceAttributes(part, request.getAttributes());
        }
        if (request.getPartName() != null) {
            part.setSeoSlug(uniqueSlug(partMapper.generateSlug(part.getPartName()), part.getId()));
        }

        return toResponse(partRepository.save(part));
    }

    @Override
    public void delete(Long partId, Long actorUserId, boolean admin) {
        Part part = requirePart(partId);
        assertCanManage(part, actorUserId, admin);
        part.setStatus(PartStatus.ARCHIVED);
        part.setActive(false);
        partRepository.save(part);
    }

    @Override
    @Transactional(readOnly = true)
    public PartResponse getDealerPart(Long partId, Long dealerId) {
        Part part = requirePart(partId);
        if (!part.getDealerId().equals(dealerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to view this part.");
        }
        return toResponse(part);
    }

    @Override
    @Transactional(readOnly = true)
    public PartResponse getManagedPart(Long partId) {
        return toResponse(requirePart(partId));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getDealerParts(
            Long dealerId, String keyword, PartStatus status, int page, int limit) {
        Specification<Part> spec = PartSpecifications.hasDealer(dealerId)
                .and(PartSpecifications.keyword(keyword))
                .and(PartSpecifications.hasStatus(status));
        return paged(spec, "newest", page, limit);
    }

    @Override
    public PartResponse getPublicPart(Long partId) {
        Part part = requirePart(partId);
        if (!isCatalogVisible(part)) {
            throw new EntityNotFoundException("Part not found.");
        }
        part.setTotalViews((part.getTotalViews() == null ? 0 : part.getTotalViews()) + 1);
        part.setTotalClicks((part.getTotalClicks() == null ? 0 : part.getTotalClicks()) + 1);
        return toResponse(partRepository.save(part));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> search(
            String keyword,
            Long categoryId,
            Long brandId,
            Long manufacturerId,
            Long dealerId,
            PartStatus status,
            Boolean featured,
            Boolean inStock,
            Boolean catalogOnly,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sort,
            int page,
            int limit
    ) {
        Specification<Part> spec = (root, query, cb) -> cb.conjunction();
        spec = spec.and(PartSpecifications.keyword(keyword))
                .and(PartSpecifications.inCategoryIds(categoryIdsIncludingChildren(categoryId)))
                .and(PartSpecifications.hasBrandId(brandId))
                .and(PartSpecifications.hasManufacturerId(manufacturerId))
                .and(PartSpecifications.hasDealer(dealerId))
                .and(PartSpecifications.isFeatured(featured))
                .and(PartSpecifications.inStock(inStock))
                .and(PartSpecifications.minPrice(minPrice))
                .and(PartSpecifications.maxPrice(maxPrice));

        if (Boolean.TRUE.equals(catalogOnly)) {
            spec = spec.and(PartSpecifications.hasStatus(PartStatus.ACTIVE))
                    .and(PartSpecifications.isActive(true));
        } else {
            spec = spec.and(PartSpecifications.hasStatus(status));
        }

        return paged(spec, sort, page, limit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getRelatedParts(Long categoryId, Long excludePartId) {
        Specification<Part> spec = PartSpecifications.inCategoryIds(categoryIdsIncludingChildren(categoryId))
                .and(PartSpecifications.hasStatus(PartStatus.ACTIVE))
                .and(PartSpecifications.isActive(true))
                .and(PartSpecifications.notId(excludePartId));

        return partRepository.findAll(spec, PageRequest.of(0, 8, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartResponse> getRelatedForCatalog(Long partId) {
        Part part = requirePart(partId);
        if (!isCatalogVisible(part)) {
            throw new EntityNotFoundException("Part not found.");
        }
        Long categoryId = part.getCategory() == null ? null : part.getCategory().getId();
        return getRelatedParts(categoryId, partId);
    }

    @Override
    public PartResponse addImage(Long partId, Long actorUserId, boolean admin, PartImageRequest request) {
        Part part = requirePart(partId);
        assertCanManage(part, actorUserId, admin);

        boolean makePrimary = Boolean.TRUE.equals(request.getPrimary()) || part.getImages().isEmpty();
        if (makePrimary) {
            part.getImages().forEach(img -> img.setPrimary(false));
        }
        int order = request.getDisplayOrder() == null ? part.getImages().size() : request.getDisplayOrder();
        part.getImages().add(PartImage.builder()
                .part(part)
                .imageUrl(request.getImageUrl())
                .displayOrder(order)
                .primary(makePrimary)
                .build());
        return toResponse(partRepository.save(part));
    }

    @Override
    public void removeImage(Long partId, Long imageId, Long actorUserId, boolean admin) {
        Part part = requirePart(partId);
        assertCanManage(part, actorUserId, admin);

        PartImage image = part.getImages().stream()
                .filter(img -> img.getId() != null && img.getId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Image not found."));
        boolean wasPrimary = Boolean.TRUE.equals(image.getPrimary());
        part.getImages().remove(image);
        partImageRepository.delete(image);
        if (wasPrimary && !part.getImages().isEmpty()) {
            part.getImages().get(0).setPrimary(true);
        }
        partRepository.save(part);
    }

    @Override
    public Map<String, Object> createInquiry(
            Long partId, Long userId, Long tenantId, CreatePartInquiryRequest request) {
        Part part = requirePart(partId);
        if (!isCatalogVisible(part)) {
            throw new EntityNotFoundException("Part not found.");
        }

        int qty = request.getQuantity() == null ? 1 : request.getQuantity();
        CreateSupportTicketRequest ticketRequest = new CreateSupportTicketRequest();
        ticketRequest.setType(SupportType.TICKET);
        ticketRequest.setPriority(TicketPriority.MEDIUM);
        ticketRequest.setSubject("Parts inquiry: " + part.getPartName());
        ticketRequest.setDescription(
                "Part: " + part.getPartName() + "\n"
                        + "Part number: " + part.getPartNumber() + "\n"
                        + "SKU: " + (part.getSku() == null ? "—" : part.getSku()) + "\n"
                        + "Quantity: " + qty + "\n"
                        + "Listing ID: " + part.getId() + "\n\n"
                        + request.getMessage().trim()
        );

        SupportTicketResponse ticket = supportTicketService.create(userId, tenantId, ticketRequest);
        part.setTotalLeads((part.getTotalLeads() == null ? 0 : part.getTotalLeads()) + 1);
        partRepository.save(part);

        Map<String, Object> body = new HashMap<>();
        body.put("message", "Inquiry sent. Our team will follow up.");
        body.put("ticket", ticket);
        return body;
    }

    public Long resolveListingOwner(Long actorUserId, boolean admin, Long requestedDealerId) {
        if (!admin) {
            return actorUserId;
        }
        if (requestedDealerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dealer is required.");
        }
        User dealer = userRepository.findById(requestedDealerId)
                .orElseThrow(() -> new EntityNotFoundException("Dealer not found."));
        if (dealer.getRole() != Role.DEALER && dealer.getRole() != Role.ADMIN
                && dealer.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user cannot own a listing.");
        }
        return dealer.getId();
    }

    private Map<String, Object> paged(Specification<Part> spec, String sort, int page, int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        Pageable pageable = PageRequest.of(safePage - 1, safeLimit, sortOf(sort));
        Page<Part> result = partRepository.findAll(spec, pageable);
        return Map.of(
                "parts", result.getContent().stream().map(this::toResponse).toList(),
                "pagination", Map.of(
                        "page", safePage,
                        "limit", safeLimit,
                        "total", result.getTotalElements(),
                        "totalPages", result.getTotalPages()
                )
        );
    }

    private Sort sortOf(String sort) {
        if (sort == null) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        return switch (sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name" -> Sort.by(Sort.Direction.ASC, "partName");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private List<Long> categoryIdsIncludingChildren(Long categoryId) {
        if (categoryId == null) {
            return List.of();
        }
        List<Long> ids = new ArrayList<>();
        ids.add(categoryId);
        partCategoryRepository.findByParentId(categoryId)
                .forEach(child -> ids.add(child.getId()));
        return ids;
    }

    private void assertCanManage(Part part, Long actorUserId, boolean admin) {
        if (admin) {
            return;
        }
        if (!part.getDealerId().equals(actorUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to modify this part.");
        }
    }

    private boolean isCatalogVisible(Part part) {
        return part.getStatus() == PartStatus.ACTIVE && Boolean.TRUE.equals(part.getActive());
    }

    private Part requirePart(Long partId) {
        return partRepository.findById(partId)
                .orElseThrow(() -> new EntityNotFoundException("Part not found."));
    }

    private PartCategory requireCategory(Long categoryId) {
        PartCategory category = partCategoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found."));
        if (!Boolean.TRUE.equals(category.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is not active.");
        }
        return category;
    }

    private UnitOfMeasure requireUnit(Long unitOfMeasureId) {
        UnitOfMeasure unit = unitOfMeasureRepository.findById(unitOfMeasureId)
                .orElseThrow(() -> new EntityNotFoundException("Unit of measure not found."));
        if (!Boolean.TRUE.equals(unit.getActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unit of measure is not active.");
        }
        return unit;
    }

    private PartBrand optionalBrand(Long brandId) {
        if (brandId == null) {
            return null;
        }
        return partBrandRepository.findById(brandId)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found."));
    }

    private Manufacturer optionalManufacturer(Long manufacturerId) {
        if (manufacturerId == null) {
            return null;
        }
        return manufacturerRepository.findById(manufacturerId)
                .orElseThrow(() -> new EntityNotFoundException("Manufacturer not found."));
    }

    private String uniqueSlug(String base, Long id) {
        String slug = (base == null || base.isBlank() ? "part" : base) + "-" + id;
        if (slug.length() > 255) {
            slug = slug.substring(0, 255);
        }
        return slug;
    }

    private PartResponse toResponse(Part part) {
        return partMapper.toResponse(part, dealerDisplayName(part.getDealerId()));
    }

    private String dealerDisplayName(Long dealerId) {
        if (dealerId == null) {
            return null;
        }
        return userRepository.findById(dealerId)
                .map(user -> {
                    String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
                    String last = user.getLastName() == null ? "" : user.getLastName().trim();
                    String name = (first + " " + last).trim();
                    return name.isBlank() ? user.getEmail() : name;
                })
                .orElse(null);
    }
}
