package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long>,
                JpaSpecificationExecutor<SupportTicket> {

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.deletedAt IS NULL AND t.status <> 'RESOLVED'")
    long countOpenTickets();

    @Query("""
        SELECT COUNT(t) FROM SupportTicket t
        WHERE t.deletedAt IS NULL AND t.status <> 'RESOLVED'
        AND (:tenantId IS NULL OR t.tenantId = :tenantId)
        """)
    long countOpenTicketsByTenant(Long tenantId);

    @Query("SELECT MAX(t.ticketNumber) FROM SupportTicket t WHERE t.ticketNumber LIKE :prefix%")
    String findMaxTicketNumberWithPrefix(String prefix);

    List<SupportTicket> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(
        Long userId
);

java.util.Optional<SupportTicket> findByIdAndUserIdAndDeletedAtIsNull(
        Long id,
        Long userId
);

}
