package com.stratumiq.backend.modules.parts.mapper;

import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.modules.parts.dto.*;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class PartMapper {

    public Part toEntity(
            CreatePartRequest request,
            Long dealerId,
            Long createdBy,
            PartCategory category,
            PartBrand brand,
            Manufacturer manufacturer,
            UnitOfMeasure unitOfMeasure
    ) {
        return Part.builder()
                .dealerId(dealerId)
                .createdBy(createdBy)
                .sku(blankToNull(request.getSku()))
                .partNumber(request.getPartNumber().trim())
                .oemNumber(blankToNull(request.getOemNumber()))
                .partName(request.getPartName().trim())
                .shortDescription(request.getShortDescription())
                .description(request.getDescription())
                .category(category)
                .brand(brand)
                .manufacturer(manufacturer)
                .unitOfMeasure(unitOfMeasure)
                .currency(request.getCurrency())
                .price(request.getPrice())
                .discountPrice(request.getDiscountPrice())
                .quantity(request.getQuantity() == null ? 0 : request.getQuantity())
                .partType(request.getPartType())
                .partCondition(request.getPartCondition())
                .warranty(blankToNull(request.getWarranty()))
                .weight(request.getWeight())
                .length(request.getLength())
                .width(request.getWidth())
                .height(request.getHeight())
                .featured(Boolean.TRUE.equals(request.getFeatured()))
                .active(request.getActive() == null || Boolean.TRUE.equals(request.getActive()))
                .status(request.getStatus() == null
                        ? com.stratumiq.backend.common.enums.PartStatus.ACTIVE
                        : request.getStatus())
                .tags(request.getTags())
                .build();
    }

    public void updateEntity(
            Part part,
            UpdatePartRequest request,
            PartCategory category,
            PartBrand brand,
            Manufacturer manufacturer,
            UnitOfMeasure unitOfMeasure
    ) {
        if (request.getSku() != null) {
            part.setSku(blankToNull(request.getSku()));
        }
        if (request.getPartName() != null) {
            part.setPartName(request.getPartName().trim());
        }
        if (request.getOemNumber() != null) {
            part.setOemNumber(blankToNull(request.getOemNumber()));
        }
        if (request.getShortDescription() != null) {
            part.setShortDescription(request.getShortDescription());
        }
        if (request.getDescription() != null) {
            part.setDescription(request.getDescription());
        }
        if (category != null) {
            part.setCategory(category);
        }
        if (request.getBrandId() != null) {
            part.setBrand(brand);
        }
        if (request.getManufacturerId() != null) {
            part.setManufacturer(manufacturer);
        }
        if (unitOfMeasure != null) {
            part.setUnitOfMeasure(unitOfMeasure);
        }
        if (request.getCurrency() != null) {
            part.setCurrency(request.getCurrency());
        }
        if (request.getPrice() != null) {
            part.setPrice(request.getPrice());
        }
        if (request.getDiscountPrice() != null) {
            part.setDiscountPrice(request.getDiscountPrice());
        }
        if (request.getQuantity() != null) {
            part.setQuantity(request.getQuantity());
        }
        if (request.getPartType() != null) {
            part.setPartType(request.getPartType());
        }
        if (request.getPartCondition() != null) {
            part.setPartCondition(request.getPartCondition());
        }
        if (request.getWarranty() != null) {
            part.setWarranty(blankToNull(request.getWarranty()));
        }
        if (request.getWeight() != null) {
            part.setWeight(request.getWeight());
        }
        if (request.getLength() != null) {
            part.setLength(request.getLength());
        }
        if (request.getWidth() != null) {
            part.setWidth(request.getWidth());
        }
        if (request.getHeight() != null) {
            part.setHeight(request.getHeight());
        }
        if (request.getFeatured() != null) {
            part.setFeatured(request.getFeatured());
        }
        if (request.getActive() != null) {
            part.setActive(request.getActive());
        }
        if (request.getTags() != null) {
            part.setTags(request.getTags());
        }
        if (request.getStatus() != null) {
            part.setStatus(request.getStatus());
        }
    }

    public void replaceImages(Part part, List<PartImageRequest> requests) {
        part.getImages().clear();
        if (requests == null || requests.isEmpty()) {
            return;
        }
        for (int i = 0; i < requests.size(); i++) {
            PartImageRequest req = requests.get(i);
            PartImage image = PartImage.builder()
                    .part(part)
                    .imageUrl(req.getImageUrl())
                    .displayOrder(req.getDisplayOrder() == null ? i : req.getDisplayOrder())
                    .primary(Boolean.TRUE.equals(req.getPrimary()) || i == 0)
                    .build();
            part.getImages().add(image);
        }
        ensureSinglePrimary(part);
    }

    public void replaceAttributes(Part part, List<PartAttributeRequest> requests) {
        part.getAttributes().clear();
        if (requests == null || requests.isEmpty()) {
            return;
        }
        for (int i = 0; i < requests.size(); i++) {
            PartAttributeRequest req = requests.get(i);
            part.getAttributes().add(PartAttribute.builder()
                    .part(part)
                    .name(req.getName().trim())
                    .value(req.getValue().trim())
                    .sortOrder(req.getSortOrder() == null ? i : req.getSortOrder())
                    .build());
        }
    }

    public PartResponse toResponse(Part part, String dealerName) {
        PartCategory category = part.getCategory();
        PartCategory parent = category != null ? category.getParent() : null;

        List<PartImageResponse> images = part.getImages().stream()
                .sorted(Comparator.comparing(PartImage::getDisplayOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(PartImage::getId, Comparator.nullsLast(Long::compareTo)))
                .map(img -> PartImageResponse.builder()
                        .id(img.getId())
                        .imageUrl(img.getImageUrl())
                        .displayOrder(img.getDisplayOrder())
                        .primary(Boolean.TRUE.equals(img.getPrimary()))
                        .build())
                .toList();

        List<PartAttributeResponse> attributes = part.getAttributes().stream()
                .sorted(Comparator.comparing(PartAttribute::getSortOrder, Comparator.nullsLast(Integer::compareTo))
                        .thenComparing(PartAttribute::getId, Comparator.nullsLast(Long::compareTo)))
                .map(attr -> PartAttributeResponse.builder()
                        .id(attr.getId())
                        .name(attr.getName())
                        .value(attr.getValue())
                        .sortOrder(attr.getSortOrder())
                        .build())
                .toList();

        Integer qty = part.getQuantity() == null ? 0 : part.getQuantity();

        return PartResponse.builder()
                .id(part.getId())
                .dealerId(part.getDealerId())
                .dealerName(dealerName)
                .sku(part.getSku())
                .partNumber(part.getPartNumber())
                .oemNumber(part.getOemNumber())
                .partName(part.getPartName())
                .seoSlug(part.getSeoSlug())
                .shortDescription(part.getShortDescription())
                .description(part.getDescription())
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .parentCategoryId(parent != null ? parent.getId() : null)
                .parentCategoryName(parent != null ? parent.getName() : null)
                .brandId(part.getBrand() != null ? part.getBrand().getId() : null)
                .brandName(part.getBrand() != null ? part.getBrand().getName() : null)
                .manufacturerId(part.getManufacturer() != null ? part.getManufacturer().getId() : null)
                .manufacturerName(part.getManufacturer() != null ? part.getManufacturer().getName() : null)
                .unitOfMeasureId(part.getUnitOfMeasure() != null ? part.getUnitOfMeasure().getId() : null)
                .unitName(part.getUnitOfMeasure() != null ? part.getUnitOfMeasure().getName() : null)
                .unitSymbol(part.getUnitOfMeasure() != null ? part.getUnitOfMeasure().getSymbol() : null)
                .currency(part.getCurrency())
                .price(part.getPrice())
                .discountPrice(part.getDiscountPrice())
                .quantity(qty)
                .partType(part.getPartType())
                .partCondition(part.getPartCondition())
                .warranty(part.getWarranty())
                .weight(part.getWeight())
                .length(part.getLength())
                .width(part.getWidth())
                .height(part.getHeight())
                .featured(part.getFeatured())
                .active(part.getActive())
                .inStock(qty > 0 && part.getStatus() == com.stratumiq.backend.common.enums.PartStatus.ACTIVE)
                .status(part.getStatus())
                .tags(part.getTags())
                .totalViews(part.getTotalViews())
                .totalClicks(part.getTotalClicks())
                .totalLeads(part.getTotalLeads())
                .images(images)
                .imageUrls(images.stream().map(PartImageResponse::getImageUrl).toList())
                .documentUrls(part.getDocuments().stream().map(PartDocument::getDocumentUrl).toList())
                .attributes(attributes)
                .createdAt(part.getCreatedAt())
                .updatedAt(part.getUpdatedAt())
                .build();
    }

    public String generateSlug(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        return text.trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-{2,}", "-");
    }

    private void ensureSinglePrimary(Part part) {
        boolean anyPrimary = part.getImages().stream().anyMatch(img -> Boolean.TRUE.equals(img.getPrimary()));
        if (!anyPrimary && !part.getImages().isEmpty()) {
            part.getImages().get(0).setPrimary(true);
        }
        boolean seen = false;
        for (PartImage image : part.getImages()) {
            if (Boolean.TRUE.equals(image.getPrimary())) {
                if (seen) {
                    image.setPrimary(false);
                }
                seen = true;
            }
        }
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
