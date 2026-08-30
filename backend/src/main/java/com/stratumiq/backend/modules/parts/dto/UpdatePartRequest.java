package com.stratumiq.backend.modules.parts.dto;

import com.stratumiq.backend.common.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdatePartRequest {

    @Size(max = 255)
    private String partName;

    @Size(max = 500)
    private String shortDescription;

    private String description;

    private Long categoryId;

    private Long brandId;

    private Long manufacturerId;

    private CurrencyType currency;

    @DecimalMin("0.00")
    private BigDecimal price;

    @DecimalMin("0.00")
    private BigDecimal discountPrice;

    @Min(0)
    private Integer quantity;

    private Long unitOfMeasureId;

    private PartType partType;

    private PartCondition partCondition;

    private PartStatus status;

    @DecimalMin("0.00")
    private BigDecimal weight;

    @Size(max = 100)
    private String sku;

    @Size(max = 150)
    private String oemNumber;

    @Size(max = 100)
    private String warranty;

    private Boolean featured;

    private Boolean active;

    @DecimalMin("0.00")
    private BigDecimal length;

    @DecimalMin("0.00")
    private BigDecimal width;

    @DecimalMin("0.00")
    private BigDecimal height;

    private String tags;

    @Valid
    private List<PartImageRequest> images;

    @Valid
    private List<PartAttributeRequest> attributes;
}
