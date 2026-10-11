package com.stratumiq.backend.modules.parts.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartImageResponse {

    private Long id;
    private String imageUrl;
    private Integer displayOrder;
    private Boolean primary;
}
