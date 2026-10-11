package com.stratumiq.backend.modules.parts.dto;

import com.stratumiq.backend.common.enums.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartResponse {

    private Long id;
    private Long dealerId;
    private String dealerName;
    private String partNumber;
    private String partName;
    private String shortDescription;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long parentCategoryId;
    private String parentCategoryName;
    private Long brandId;
    private String brandName;
    private Long manufacturerId;
    private String manufacturerName;
    private CurrencyType currency;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer quantity;
    private Long unitOfMeasureId;
    private String unitName;
    private String unitSymbol;
    private PartType partType;
    private PartCondition partCondition;
    private PartStatus status;
    private BigDecimal weight;
    private String tags;
    private Integer totalViews;
    private Integer totalClicks;
    private Integer totalLeads;
    private List<PartImageResponse> images;
    private List<String> imageUrls;
    private List<String> documentUrls;
    private List<PartAttributeResponse> attributes;
    private Instant createdAt;
    private Instant updatedAt;
    private String sku;
    private String oemNumber;
    private String warranty;
    private Boolean featured;
    private Boolean active;
    private Boolean inStock;
    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;
    private String seoSlug;
}
