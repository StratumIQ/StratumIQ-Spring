package com.stratumiq.backend.modules.equipment;

import com.stratumiq.backend.entity.EquipmentCatalogItem;
import com.stratumiq.backend.modules.equipment.dto.CreateEquipmentCatalogRequest;
import com.stratumiq.backend.repository.EquipmentCatalogRepository;
import com.stratumiq.backend.repository.EquipmentOemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EquipmentCatalogServiceTest {

    @Mock private EquipmentCatalogRepository equipmentRepository;
    @Mock private EquipmentOemRepository oemRepository;
    @InjectMocks private EquipmentCatalogService service;

    @Test
    void listReturnsFrontendPaginationContractForPopulatedPage() {
        EquipmentCatalogItem item = item("EQ-TEST-1");
        when(equipmentRepository.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(1, 1), 2));
        when(oemRepository.findAllById(anyList())).thenReturn(List.of());

        Map<String, Object> result = service.list("Acme", "jaw_crusher", "static", null,
            "model", 2, 1);

        assertThat(result).containsEntry("total", 2L)
            .containsEntry("page", 2)
            .containsEntry("pages", 2)
            .containsEntry("limit", 1);
        assertThat((List<?>) result.get("data")).hasSize(1);
        verify(equipmentRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void listReturnsStableEmptyPageContract() {
        when(equipmentRepository.findAll(any(Specification.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));
        when(oemRepository.findAllById(anyList())).thenReturn(List.of());

        Map<String, Object> result = service.list(null, null, null, null, null, 1, 20);

        assertThat(result).containsEntry("total", 0L)
            .containsEntry("page", 1)
            .containsEntry("pages", 1)
            .containsEntry("limit", 20);
        assertThat((List<?>) result.get("data")).isEmpty();
    }

    @Test
    void createGeneratesEquipmentIdWhenOmitted() {
        when(equipmentRepository.save(any(EquipmentCatalogItem.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> result = service.create(new CreateEquipmentCatalogRequest(
            null, null, "Acme", null, "Model X", "jaw_crusher", "static",
            null, false, null, "draft"));

        String equipmentId = (String) result.get("equipment_id");
        assertThat(equipmentId).matches("EQ-[A-F0-9]{8}");
        assertThat(result).containsKey("equipment");
    }

    private EquipmentCatalogItem item(String equipmentId) {
        EquipmentCatalogItem item = new EquipmentCatalogItem();
        item.setEquipmentId(equipmentId);
        item.setBrand("Acme");
        item.setModelName("Model X");
        item.setEquipmentType("jaw_crusher");
        item.setMobilityType("static");
        item.setStatus("active");
        item.setHardRockRated(false);
        return item;
    }
}
