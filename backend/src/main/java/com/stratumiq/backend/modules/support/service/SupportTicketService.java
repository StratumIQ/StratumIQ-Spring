package com.stratumiq.backend.modules.support.service;

import com.stratumiq.backend.modules.support.dto.CreateSupportTicketNoteRequest;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketRequest;
import com.stratumiq.backend.modules.support.dto.SupportTicketResponse;

import java.util.List;

public interface SupportTicketService {

    SupportTicketResponse create(
            Long userId,
            Long tenantId,
            CreateSupportTicketRequest request
    );

    List<SupportTicketResponse> getMyTickets(
            Long userId
    );

    SupportTicketResponse getById(
            Long ticketId,
            Long userId
    );

    SupportTicketResponse addNote(
            Long userId,
            Long ticketId,
            CreateSupportTicketNoteRequest request
    );

    List<SupportTicketResponse> getMyTickets(
            Long userId,
            String status,
            String search,
            Integer page,
            Integer limit
    );

    List<SupportTicketResponse> getAllTickets();

    SupportTicketResponse getTicketForAdmin(Long ticketId);
}