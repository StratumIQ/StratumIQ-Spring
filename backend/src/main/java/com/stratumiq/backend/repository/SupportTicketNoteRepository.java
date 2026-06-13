package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.SupportTicketNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportTicketNoteRepository extends JpaRepository<SupportTicketNote, Long> {
    List<SupportTicketNote> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
