package com.stratumiq.backend.modules.equipment;

import com.stratumiq.backend.entity.EquipmentCatalogItem;
import com.stratumiq.backend.entity.EquipmentOem;
import com.stratumiq.backend.modules.equipment.dto.*;
import com.stratumiq.backend.repository.EquipmentCatalogRepository;
import com.stratumiq.backend.repository.EquipmentOemRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EquipmentCatalogService {

    private final EquipmentCatalogRepository equipmentRepository;
    private final EquipmentOemRepository oemRepository;

    public EquipmentCatalogService(EquipmentCatalogRepository equipmentRepository,
                                   EquipmentOemRepository oemRepository) {
        this.equipmentRepository = equipmentRepository;
        this.oemRepository = oemRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(String brand, String equipmentType, String mobilityType,
                                    Long oemId, String search, int page, int limit) {
        Specification<EquipmentCatalogItem> specification = (root, query, criteria) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (brand != null && !brand.isBlank()) {
                predicates.add(criteria.equal(criteria.lower(root.get("brand")), brand.trim().toLowerCase(Locale.ROOT)));
            }
            if (equipmentType != null && !equipmentType.isBlank()) {
                predicates.add(criteria.equal(root.get("equipmentType"), equipmentType));
            }
            if (mobilityType != null && !mobilityType.isBlank()) {
                predicates.add(criteria.equal(root.get("mobilityType"), mobilityType));
            }
            if (oemId != null) predicates.add(criteria.equal(root.get("oemId"), oemId));
            if (search != null && !search.isBlank()) {
                String value = escapeLike(search.trim().toLowerCase(Locale.ROOT));
                String pattern = "%" + value + "%";
                predicates.add(criteria.or(
                    criteria.like(criteria.lower(root.get("equipmentId")), pattern, '\\'),
                    criteria.like(criteria.lower(root.get("brand")), pattern, '\\'),
                    criteria.like(criteria.lower(root.get("series")), pattern, '\\'),
                    criteria.like(criteria.lower(root.get("modelName")), pattern, '\\')
                ));
            }
            return criteria.and(predicates.toArray(Predicate[]::new));
        };

        Pageable pageable = PageRequest.of(page - 1, limit,
            Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        Page<EquipmentCatalogItem> result = equipmentRepository.findAll(specification, pageable);
        Map<Long, String> oemNames = loadOemNames(result.getContent());
        List<EquipmentCatalogResponse> data = result.getContent().stream()
            .map(item -> response(item, oemNames.get(item.getOemId())))
            .toList();

        return Map.of(
            "data", data,
            "total", result.getTotalElements(),
            "page", page,
            "pages", Math.max(1, result.getTotalPages()),
            "limit", limit
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> get(String equipmentId) {
        EquipmentCatalogItem item = find(equipmentId);
        String oemName = item.getOemId() == null ? null : oemRepository.findById(item.getOemId())
            .map(EquipmentOem::getName).orElse(null);
        return Map.of("identity", response(item, oemName));
    }

    @Transactional
    public Map<String, Object> create(CreateEquipmentCatalogRequest request) {
        EquipmentCatalogItem item = new EquipmentCatalogItem();
        String equipmentId = request.equipmentId();
        item.setEquipmentId(equipmentId == null || equipmentId.isBlank()
            ? "EQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT)
            : equipmentId.trim());
        item.setBrand(request.brand().trim());
        item.setSeries(trimToNull(request.series()));
        item.setModelName(request.modelName().trim());
        item.setEquipmentType(request.equipmentType());
        item.setMobilityType(request.mobilityType());
        item.setApplicationStage(trimToNull(request.applicationStage()));
        item.setHardRockRated(Boolean.TRUE.equals(request.hardRockRated()));
        item.setYearIntroduced(request.yearIntroduced());
        item.setStatus(request.status() == null ? "draft" : request.status());
        if (request.oemId() != null) {
            requireOem(request.oemId());
            item.setOemId(request.oemId());
        }
        item = equipmentRepository.save(item);
        EquipmentCatalogResponse response = response(item,
            item.getOemId() == null ? null : requireOem(item.getOemId()).getName());
        return Map.of("equipment_id", item.getEquipmentId(), "equipment", response);
    }

    @Transactional
    public Map<String, Object> update(String equipmentId, UpdateEquipmentCatalogRequest request) {
        EquipmentCatalogItem item = find(equipmentId);
        if (request.brand() != null) item.setBrand(requireText(request.brand(), "brand"));
        if (request.series() != null) item.setSeries(trimToNull(request.series()));
        if (request.modelName() != null) item.setModelName(requireText(request.modelName(), "model_name"));
        if (request.equipmentType() != null) item.setEquipmentType(request.equipmentType());
        if (request.mobilityType() != null) item.setMobilityType(request.mobilityType());
        if (request.applicationStage() != null) item.setApplicationStage(trimToNull(request.applicationStage()));
        if (request.hardRockRated() != null) item.setHardRockRated(request.hardRockRated());
        if (request.yearIntroduced() != null) item.setYearIntroduced(request.yearIntroduced());
        if (request.status() != null) item.setStatus(request.status());
        if (request.oemId() != null) {
            requireOem(request.oemId());
            item.setOemId(request.oemId());
        }
        item = equipmentRepository.save(item);
        return Map.of("equipment", response(item,
            item.getOemId() == null ? null : requireOem(item.getOemId()).getName()));
    }

    @Transactional
    public Map<String, Object> updateStatus(String equipmentId, String status) {
        if (status == null || !Set.of("active", "discontinued", "draft").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid equipment status");
        }
        EquipmentCatalogItem item = find(equipmentId);
        item.setStatus(status);
        item = equipmentRepository.save(item);
        return Map.of("equipment", response(item,
            item.getOemId() == null ? null : requireOem(item.getOemId()).getName()));
    }

    @Transactional(readOnly = true)
    public List<EquipmentOemResponse> listOems() {
        return oemRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
            .map(EquipmentCatalogService::oemResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public EquipmentOemResponse getOem(Long id) {
        return oemResponse(requireOem(id));
    }

    @Transactional
    public EquipmentOemResponse createOem(EquipmentOemRequest request) {
        String name = requireText(request.name(), "name");
        if (oemRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "OEM already exists");
        }
        EquipmentOem oem = new EquipmentOem();
        applyOemFields(oem, request, true);
        return oemResponse(oemRepository.save(oem));
    }

    @Transactional
    public EquipmentOemResponse updateOem(Long id, EquipmentOemRequest request) {
        EquipmentOem oem = requireOem(id);
        if (request.name() != null) {
            String name = requireText(request.name(), "name");
            if (!name.equalsIgnoreCase(oem.getName()) && oemRepository.existsByNameIgnoreCase(name)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "OEM already exists");
            }
            oem.setName(name);
        }
        if (request.country() != null) oem.setCountry(trimToNull(request.country()));
        if (request.website() != null) oem.setWebsite(trimToNull(request.website()));
        if (request.logoUrl() != null) oem.setLogoUrl(trimToNull(request.logoUrl()));
        return oemResponse(oemRepository.save(oem));
    }

    private Map<Long, String> loadOemNames(List<EquipmentCatalogItem> items) {
        List<Long> ids = items.stream().map(EquipmentCatalogItem::getOemId)
            .filter(Objects::nonNull).distinct().toList();
        return oemRepository.findAllById(ids).stream()
            .collect(Collectors.toMap(EquipmentOem::getId, EquipmentOem::getName));
    }

    private EquipmentCatalogItem find(String equipmentId) {
        return equipmentRepository.findByEquipmentId(equipmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));
    }

    private EquipmentOem requireOem(Long id) {
        return oemRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "OEM not found"));
    }

    private static EquipmentCatalogResponse response(EquipmentCatalogItem item, String oemName) {
        return new EquipmentCatalogResponse(item.getEquipmentId(), item.getOemId(), item.getBrand(),
            item.getSeries(), item.getModelName(), item.getEquipmentType(), item.getMobilityType(),
            item.getApplicationStage(), item.isHardRockRated(), item.getYearIntroduced(),
            item.getStatus(), item.getCreatedAt(), oemName);
    }

    private static EquipmentOemResponse oemResponse(EquipmentOem oem) {
        return new EquipmentOemResponse(oem.getId(), oem.getName(), oem.getCountry(),
            oem.getWebsite(), oem.getLogoUrl(), oem.getCreatedAt());
    }

    private static void applyOemFields(EquipmentOem oem, EquipmentOemRequest request, boolean create) {
        if (create || request.name() != null) oem.setName(requireText(request.name(), "name"));
        oem.setCountry(trimToNull(request.country()));
        oem.setWebsite(trimToNull(request.website()));
        oem.setLogoUrl(trimToNull(request.logoUrl()));
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required");
        }
        return value.trim();
    }

    private static String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}