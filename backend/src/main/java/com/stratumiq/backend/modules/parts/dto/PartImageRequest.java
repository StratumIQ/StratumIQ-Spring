package com.stratumiq.backend.modules.parts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartImageRequest {

    @NotBlank
    @Pattern(regexp = "^/uploads/.*$", message = "Image must be an uploaded file URL")
    private String imageUrl;

    private Integer displayOrder;

    private Boolean primary;
}
