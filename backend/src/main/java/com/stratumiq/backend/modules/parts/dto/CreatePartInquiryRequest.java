package com.stratumiq.backend.modules.parts.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePartInquiryRequest {

    @NotBlank
    @Size(max = 2000)
    private String message;

    @Min(1)
    private Integer quantity;
}
