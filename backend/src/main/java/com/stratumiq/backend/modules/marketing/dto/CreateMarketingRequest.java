package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.MarketingContentStatus;
import com.stratumiq.backend.common.enums.MarketingContentType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateMarketingRequest {

    @NotNull(message = "Content type is required")
    private MarketingContentType type;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    private String title;

    @Size(max = 300, message = "Subtitle must not exceed 300 characters")
    private String subtitle;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String body;

    @Size(max = 10000, message = "Rich content must not exceed 10000 characters")
    private String richContent;

    @NotBlank(message = "Banner image is required")
    @Size(max = 2048, message = "Image URL must not exceed 2048 characters")
    @Pattern(regexp = "^(https?://.*|/uploads/.*)?$", message = "Banner image must be a valid uploaded image URL")
    private String imageUrl;

    @NotBlank(message = "Thumbnail image is required")
    @Size(max = 2048, message = "Thumbnail URL must not exceed 2048 characters")
    @Pattern(regexp = "^(https?://.*|/uploads/.*)?$", message = "Thumbnail image must be a valid uploaded image URL")
    private String thumbnailUrl;

    @Size(max = 100, message = "CTA text must not exceed 100 characters")
    private String ctaText;

    @Size(max = 2048, message = "CTA URL must not exceed 2048 characters")
    @Pattern(regexp = "^(https?://.*)?$", message = "CTA URL must be a valid HTTP(S) URL")
    private String ctaUrl;

    private Boolean isActive;

    private MarketingContentStatus status;

    private Boolean isPinned;

    @Min(value = 1, message = "Priority must be greater than zero")
    @Max(value = 100, message = "Priority must not exceed 100")
    private Integer priority;

    @Size(max = 500, message = "Tags must not exceed 500 characters")
    private String tags;

    private Instant startsAt;

    private Instant endsAt;

    private Integer sortOrder;
}
