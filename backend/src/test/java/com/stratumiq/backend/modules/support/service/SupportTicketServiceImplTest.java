package com.stratumiq.backend.modules.support.service;

import com.stratumiq.backend.common.enums.SupportType;
import com.stratumiq.backend.common.enums.TicketPriority;
import com.stratumiq.backend.common.enums.TicketStatus;
import com.stratumiq.backend.entity.SupportTicket;
import com.stratumiq.backend.entity.SupportTicketNote;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketNoteRequest;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketRequest;
import com.stratumiq.backend.modules.support.dto.SupportTicketResponse;
import com.stratumiq.backend.repository.SupportTicketNoteRepository;
import com.stratumiq.backend.repository.SupportTicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Year;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupportTicketServiceImplTest {

    @Mock
    private SupportTicketRepository supportTicketRepository;

    @Mock
    private SupportTicketNoteRepository supportTicketNoteRepository;

    @InjectMocks
    private SupportTicketServiceImpl service;

    @Test
    void createUsesUnifiedTicketNumberPrefix() {
        CreateSupportTicketRequest request = new CreateSupportTicketRequest();
        request.setType(SupportType.TICKET);
        request.setSubject("Login issue");
        request.setDescription("I cannot sign in");
        request.setPriority(TicketPriority.HIGH);

        when(supportTicketRepository.findMaxTicketNumberWithPrefix(any(String.class))).thenReturn(null);
        when(supportTicketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> {
            SupportTicket ticket = invocation.getArgument(0);
            ticket.setId(42L);
            return ticket;
        });

        SupportTicketResponse response = service.create(7L, 9L, request);

        ArgumentCaptor<SupportTicket> captor = ArgumentCaptor.forClass(SupportTicket.class);
        verify(supportTicketRepository).save(captor.capture());

        String expectedPrefix = "TKT-" + Year.now().getValue() + "-";
        assertThat(response.getTicketNumber()).startsWith(expectedPrefix);
        assertThat(captor.getValue().getTicketNumber()).startsWith(expectedPrefix);
        assertThat(captor.getValue().getCreatedBy()).isEqualTo(7L);
        assertThat(response.getTicketNumber()).endsWith("-0001");
    }

    @Test
    void addNoteCreatesPublicNoteForOwnedTicket() {
        SupportTicket ticket = SupportTicket.builder()
            .id(11L)
            .userId(7L)
            .tenantId(9L)
            .subject("Login issue")
            .description("Cannot sign in")
            .status(TicketStatus.OPEN)
            .priority(TicketPriority.HIGH)
            .type(SupportType.TICKET)
            .build();

        CreateSupportTicketNoteRequest request = new CreateSupportTicketNoteRequest();
        request.setBody("Thanks for the update");

        when(supportTicketRepository.findByIdAndUserIdAndDeletedAtIsNull(11L, 7L)).thenReturn(Optional.of(ticket));
        when(supportTicketNoteRepository.save(any(SupportTicketNote.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(supportTicketNoteRepository.findByTicketIdOrderByCreatedAtAsc(11L)).thenReturn(List.of(SupportTicketNote.builder()
            .id(99L)
            .ticketId(11L)
            .authorId(7L)
            .body("Thanks for the update")
            .isInternal(false)
            .build()));

        SupportTicketResponse response = service.addNote(7L, 11L, request);

        assertThat(response.getNotes()).hasSize(1);
        assertThat(response.getNotes().get(0).getBody()).isEqualTo("Thanks for the update");
        assertThat(response.getNotes().get(0).isInternal()).isFalse();
    }
}
