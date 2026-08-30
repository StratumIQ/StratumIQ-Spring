package com.stratumiq.backend.modules.parts.service;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.modules.parts.dto.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface PartService {

    PartResponse create(Long dealerId, Long createdBy, CreatePartRequest request);

    PartResponse update(Long partId, Long actorUserId, boolean admin, UpdatePartRequest request);

    void delete(Long partId, Long actorUserId, boolean admin);

    PartResponse getDealerPart(Long partId, Long dealerId);

    PartResponse getManagedPart(Long partId);

    Map<String, Object> getDealerParts(
            Long dealerId,
            String keyword,
            PartStatus status,
            int page,
            int limit
    );

    PartResponse getPublicPart(Long partId);

    Map<String, Object> search(
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
    );

    List<PartResponse> getRelatedParts(Long categoryId, Long excludePartId);

    List<PartResponse> getRelatedForCatalog(Long partId);

    PartResponse addImage(Long partId, Long actorUserId, boolean admin, PartImageRequest request);

    void removeImage(Long partId, Long imageId, Long actorUserId, boolean admin);

    Map<String, Object> createInquiry(Long partId, Long userId, Long tenantId, CreatePartInquiryRequest request);

    Long resolveListingOwner(Long actorUserId, boolean admin, Long requestedDealerId);
}
