package com.stratumiq.backend.repository;

import com.stratumiq.backend.common.enums.OtpType;
import com.stratumiq.backend.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByUserIdAndTypeOrderByCreatedAtDesc(
        Long userId, OtpType type
    );

    void deleteByUserIdAndType(Long userId, OtpType type);
}