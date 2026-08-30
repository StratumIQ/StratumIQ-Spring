package com.stratumiq.backend.modules.parts.service;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.entity.Part;
import com.stratumiq.backend.modules.parts.mapper.PartMapper;
import com.stratumiq.backend.modules.parts.service.impl.PartServiceImpl;
import com.stratumiq.backend.modules.support.service.SupportTicketService;
import com.stratumiq.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PartServiceImplTest {

    @Mock private PartRepository partRepository;
    @Mock private PartCategoryRepository partCategoryRepository;
    @Mock private PartBrandRepository partBrandRepository;
    @Mock private ManufacturerRepository manufacturerRepository;
    @Mock private UnitOfMeasureRepository unitOfMeasureRepository;
    @Mock private PartImageRepository partImageRepository;
    @Mock private UserRepository userRepository;
    @Mock private SupportTicketService supportTicketService;
    @Mock private PartMapper partMapper;

    @InjectMocks private PartServiceImpl service;

    @Test
    void dealerCannotReadAnotherDealersListing() {
        when(partRepository.findById(41L)).thenReturn(Optional.of(partOwnedBy(7L)));

        assertThatThrownBy(() -> service.getDealerPart(41L, 8L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not authorized");
    }

    @Test
    void dealerCannotUpdateAnotherDealersListing() {
        when(partRepository.findById(41L)).thenReturn(Optional.of(partOwnedBy(7L)));

        assertThatThrownBy(() -> service.update(41L, 8L, false, new com.stratumiq.backend.modules.parts.dto.UpdatePartRequest()))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not authorized");
        verify(partRepository, never()).save(any());
    }

    @Test
    void dealerCannotArchiveAnotherDealersListing() {
        when(partRepository.findById(41L)).thenReturn(Optional.of(partOwnedBy(7L)));

        assertThatThrownBy(() -> service.delete(41L, 8L, false))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not authorized");
        verify(partRepository, never()).save(any());
    }

    private Part partOwnedBy(Long dealerId) {
        return Part.builder()
                .id(41L)
                .dealerId(dealerId)
                .createdBy(dealerId)
                .partNumber("JAW-001")
                .partName("Jaw plate")
                .status(PartStatus.ACTIVE)
                .build();
    }
}
