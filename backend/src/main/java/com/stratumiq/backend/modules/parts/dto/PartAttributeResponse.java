package com.stratumiq.backend.modules.parts.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartAttributeResponse {

    private Long id;
    private String name;
    private String value;
    private Integer sortOrder;
}
