package com.stratumiq.backend.modules.admin.mapper;

import com.stratumiq.backend.common.enums.SupportType;
import com.stratumiq.backend.common.enums.TicketPriority;
import com.stratumiq.backend.common.enums.TicketStatus;
import com.stratumiq.backend.entity.SupportTicket;
import com.stratumiq.backend.modules.admin.response.AdminTicketResponse;
import com.stratumiq.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminMapperTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AdminMapper mapper;

    @Test
    void toTicketResponseIncludesSupportType() {
        SupportTicket ticket = SupportTicket.builder()
            .id(1L)
            .ticketNumber("TKT-2026-0001")
            .userId(10L)
            .subject("Login issue")
            .description("Cannot sign in")
            .status(TicketStatus.OPEN)
            .priority(TicketPriority.HIGH)
            .type(SupportType.FEEDBACK)
            .build();

        when(userRepository.findById(10L)).thenReturn(java.util.Optional.empty());

        AdminTicketResponse response = mapper.toTicketResponse(ticket, List.of());

        assertThat(response.type()).isEqualTo(SupportType.FEEDBACK.name());
    }
}
