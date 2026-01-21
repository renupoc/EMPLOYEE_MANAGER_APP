package com.example.attendance.repository;

import com.example.attendance.entity.AttendanceDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceDayRepository
        extends JpaRepository<AttendanceDay, Long> {

    // ✅ Used for weekly calculations
    List<AttendanceDay> findByEmployee_IdAndDateBetween(
            Long employeeId,
            LocalDate start,
            LocalDate end
    );

    // ✅ Avoid duplicate daily records
    Optional<AttendanceDay> findByEmployee_IdAndDate(
            Long employeeId,
            LocalDate date
    );

    // ✅ FAST existence check
    boolean existsByEmployee_IdAndDate(
            Long employeeId,
            LocalDate date
    );

    // ✅ REQUIRED for weekly admin update
    void deleteByEmployee_IdAndDateBetween(
            Long employeeId,
            LocalDate start,
            LocalDate end
    );
}
