package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>,
        JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL AND (:tenantId IS NULL OR u.tenantId = :tenantId)")
    long countActiveUsers(Long tenantId);

    @Query("""
        SELECT COUNT(u) FROM User u
        WHERE u.deletedAt IS NULL
        AND u.lastLoginAt >= :since
        AND (:tenantId IS NULL OR u.tenantId = :tenantId)
        """)
    long countUsersLoggedInSince(Instant since, Long tenantId);

    @Query("""
        SELECT COUNT(u) FROM User u
        WHERE u.deletedAt IS NULL
        AND u.createdAt >= :since
        AND (:tenantId IS NULL OR u.tenantId = :tenantId)
        """)
    long countRegisteredSince(Instant since, Long tenantId);

    @Query("""
        SELECT CAST(u.createdAt AS date), COUNT(u)
        FROM User u
        WHERE u.deletedAt IS NULL
        AND u.createdAt >= :since
        AND (:tenantId IS NULL OR u.tenantId = :tenantId)
        GROUP BY CAST(u.createdAt AS date)
        ORDER BY CAST(u.createdAt AS date)
        """)
    List<Object[]> countRegistrationsByDay(Instant since, Long tenantId);

    @Query("""
        SELECT u.id, u.firstName, u.lastName, u.email, COUNT(e)
        FROM User u
        LEFT JOIN FleetEquipment e ON e.userId = u.id
        WHERE u.deletedAt IS NULL
        AND (:tenantId IS NULL OR u.tenantId = :tenantId)
        GROUP BY u.id, u.firstName, u.lastName, u.email
        ORDER BY COUNT(e) DESC
        """)
    List<Object[]> findMostActiveCustomers(Long tenantId, org.springframework.data.domain.Pageable pageable);
}