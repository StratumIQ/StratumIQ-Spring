package com.stratumiq.backend.modules.marketing.service;

import com.stratumiq.backend.entity.MarketingContent;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class MarketingServiceTest {

    @Test
    void normalizePrioritiesAssignsUniqueValuesWhenDuplicatesExist() {
        MarketingContent first = MarketingContent.builder()
            .id(1L)
            .priority(10)
            .sortOrder(1)
            .createdAt(Instant.parse("2024-01-01T00:00:00Z"))
            .build();

        MarketingContent second = MarketingContent.builder()
            .id(2L)
            .priority(10)
            .sortOrder(2)
            .createdAt(Instant.parse("2024-01-01T00:01:00Z"))
            .build();

        MarketingContent third = MarketingContent.builder()
            .id(3L)
            .priority(5)
            .sortOrder(3)
            .createdAt(Instant.parse("2024-01-01T00:02:00Z"))
            .build();

        MarketingService.normalizePriorities(List.of(first, second, third));

        assertThat(first.getPriority()).isEqualTo(10);
        assertThat(second.getPriority()).isEqualTo(11);
        assertThat(third.getPriority()).isEqualTo(5);
    }
}
