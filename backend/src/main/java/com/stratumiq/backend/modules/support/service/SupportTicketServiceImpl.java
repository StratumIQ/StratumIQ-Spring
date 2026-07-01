package com.stratumiq.backend.modules.support.service;

import com.stratumiq.backend.entity.SupportTicket;
import com.stratumiq.backend.entity.SupportTicketNote;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketNoteRequest;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketRequest;
import com.stratumiq.backend.modules.support.dto.SupportTicketNoteResponse;
import com.stratumiq.backend.modules.support.dto.SupportTicketResponse;
import com.stratumiq.backend.repository.SupportTicketNoteRepository;
import com.stratumiq.backend.repository.SupportTicketRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class SupportTicketServiceImpl
        implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final SupportTicketNoteRepository supportTicketNoteRepository;

    public SupportTicketServiceImpl(
            SupportTicketRepository supportTicketRepository,
            SupportTicketNoteRepository supportTicketNoteRepository
    ) {
        this.supportTicketRepository = supportTicketRepository;
        this.supportTicketNoteRepository = supportTicketNoteRepository;
    }

    @Override
    public SupportTicketResponse create(
            Long userId,
            Long tenantId,
            CreateSupportTicketRequest request
    ) {
        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(generateTicketNumber())
                .userId(userId)
                .tenantId(tenantId)
                .createdBy(userId)
                .type(request.getType())
                .subject(request.getSubject())
                .description(request.getDescription())
                .priority(request.getPriority())
                .build();

        SupportTicket savedTicket = supportTicketRepository.save(ticket);

        return map(savedTicket);
    }

    @Override
    public List<SupportTicketResponse> getAllTickets() {
        return supportTicketRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public SupportTicketResponse getTicketForAdmin(Long ticketId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Support ticket not found"));

        return map(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMyTickets(Long userId) {
        return supportTicketRepository
                .findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketResponse> getMyTickets(Long userId, String status, String search, Integer page, Integer limit) {
        List<SupportTicket> tickets = supportTicketRepository
                .findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(userId)
                .stream()
                .filter(ticket -> matchesStatus(ticket, status))
                .filter(ticket -> matchesSearch(ticket, search))
                .sorted(Comparator.comparing(SupportTicket::getCreatedAt).reversed())
                .toList();

        int safePage = page != null && page > 0 ? page : 1;
        int safeLimit = limit != null && limit > 0 ? limit : 10;
        int fromIndex = Math.max(0, (safePage - 1) * safeLimit);
        int toIndex = Math.min(tickets.size(), fromIndex + safeLimit);

        if (fromIndex >= tickets.size()) {
            return List.of();
        }

        return tickets.subList(fromIndex, toIndex).stream().map(this::map).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SupportTicketResponse getById(
            Long ticketId,
            Long userId
    ) {

    SupportTicket ticket =
            supportTicketRepository
                    .findByIdAndUserIdAndDeletedAtIsNull(
                            ticketId,
                            userId
                    )
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Support ticket not found"
                            ));

    return map(ticket);
}




    @Override
    public SupportTicketResponse addNote(Long userId, Long ticketId, CreateSupportTicketNoteRequest request) {
        SupportTicket ticket = supportTicketRepository
                .findByIdAndUserIdAndDeletedAtIsNull(ticketId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Support ticket not found"));

        SupportTicketNote note = SupportTicketNote.builder()
                .ticketId(ticket.getId())
                .authorId(userId)
                .body(request.getBody())
                .isInternal(false)
                .build();

        supportTicketNoteRepository.save(note);
        return map(ticket);
    }

    private SupportTicketResponse map(SupportTicket ticket) {
        List<SupportTicketNote> notes = supportTicketNoteRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
        List<SupportTicketNoteResponse> noteResponses = new ArrayList<>();
        for (SupportTicketNote note : notes) {
            if (Boolean.TRUE.equals(note.getIsInternal())) {
                continue;
            }
            noteResponses.add(SupportTicketNoteResponse.builder()
                    .id(note.getId())
                    .body(note.getBody())
                    .internal(Boolean.TRUE.equals(note.getIsInternal()))
                    .createdAt(note.getCreatedAt())
                    .build());
        }

        return SupportTicketResponse.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .type(ticket.getType())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .priority(ticket.getPriority())
                .assignedTo(ticket.getAssignedTo())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .notes(noteResponses)
                .build();
    }

    private boolean matchesStatus(SupportTicket ticket, String status) {
        if (status == null || status.isBlank()) {
            return true;
        }
        return ticket.getStatus() != null && ticket.getStatus().name().equalsIgnoreCase(status.trim());
    }

    private boolean matchesSearch(SupportTicket ticket, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String needle = search.trim().toLowerCase(Locale.ROOT);
        return (ticket.getSubject() != null && ticket.getSubject().toLowerCase(Locale.ROOT).contains(needle))
                || (ticket.getDescription() != null && ticket.getDescription().toLowerCase(Locale.ROOT).contains(needle))
                || (ticket.getTicketNumber() != null && ticket.getTicketNumber().toLowerCase(Locale.ROOT).contains(needle));
    }

    private String generateTicketNumber() {
        String year = String.valueOf(Year.now().getValue());
        String prefix = "TKT-" + year + "-";

        String lastTicket = supportTicketRepository.findMaxTicketNumberWithPrefix(prefix);

        if (lastTicket == null) {
            return prefix + "0001";
        }

        int nextNumber = Integer.parseInt(lastTicket.substring(lastTicket.lastIndexOf("-") + 1)) + 1;

        return prefix + String.format("%04d", nextNumber);
    }
}