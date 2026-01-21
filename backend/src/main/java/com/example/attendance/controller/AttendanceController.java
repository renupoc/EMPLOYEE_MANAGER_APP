package com.example.attendance.controller;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.dto.WeeklySummaryResponse;
import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.AttendanceDay;
import com.example.attendance.entity.Employee;
import com.example.attendance.repository.AttendanceDayRepository;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.EmployeeRepository;
import com.example.attendance.service.AttendanceService;
import com.example.attendance.dto.WeeklyUpdateRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:4200")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceDayRepository attendanceDayRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceRepository attendanceRepository,
            AttendanceDayRepository attendanceDayRepository,
            EmployeeRepository employeeRepository,
            AttendanceService attendanceService) {

        this.attendanceRepository = attendanceRepository;
        this.attendanceDayRepository = attendanceDayRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceService = attendanceService;
    }

    // =====================================================
    // EMPLOYEE – Submit Attendance (MONTHLY + DAILY)
    // =====================================================
    @PostMapping("/submit/{employeeId}")
    public ResponseEntity<?> submitAttendance(
            @PathVariable Long employeeId,
            @RequestBody AttendanceRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // =========================
        // STRONG VALIDATIONS
        // =========================
        if (request.getTotalWorkingDays() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Total working days must be greater than 0"));
        }

        if (request.getWorkedDays() > request.getTotalWorkingDays()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Worked days cannot exceed total working days"));
        }

        if (request.getTotalWorkingDays() > request.getTotalDays()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Working days cannot exceed total days"));
        }

        // =========================
        // UPSERT MONTHLY SUMMARY
        // =========================
        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndMonthAndYear(
                        employeeId,
                        request.getMonth(),
                        request.getYear()
                )
                .orElseGet(Attendance::new);

        attendance.setEmployee(employee);
        attendance.setMonth(request.getMonth());
        attendance.setYear(request.getYear());
        attendance.setTotalDays(request.getTotalDays());
        attendance.setTotalWorkingDays(request.getTotalWorkingDays());
        attendance.setWorkedDays(request.getWorkedDays());

        attendanceRepository.save(attendance);

        // =========================
        // SAVE DAILY ATTENDANCE
        // (NO DUPLICATES)
        // =========================
        if (request.getSelectedDates() != null && !request.getSelectedDates().isEmpty()) {

            for (String dateStr : request.getSelectedDates()) {

                LocalDate date = LocalDate.parse(dateStr);

                // delete existing record for that day (if any)
                attendanceDayRepository.findByEmployee_IdAndDate(employeeId, date).
                ifPresent(attendanceDayRepository::delete);

                AttendanceDay day = new AttendanceDay();
                day.setEmployee(employee);
                day.setDate(date);
                day.setStatus("PRESENT");

                attendanceDayRepository.save(day);
            }
        }

        return ResponseEntity.ok(
                Map.of(
                        "message", "Attendance saved successfully",
                        "employeeId", employeeId,
                        "month", request.getMonth(),
                        "year", request.getYear()
                )
        );
    }

    // =====================================================
    // EMPLOYEE – Get own attendance (Monthly)
    // =====================================================
    @GetMapping("/employee/{employeeId}")
    public List<Attendance> getAttendanceByEmployee(
            @PathVariable Long employeeId) {

        return attendanceRepository.findByEmployeeId(employeeId);
    }

    // =====================================================
    // ADMIN – Get ALL attendance
    // =====================================================
    @GetMapping("/admin/all")
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // =====================================================
    // ADMIN – Employee + Attendance (Monthly table)
    // =====================================================
    @GetMapping("/admin/employees-attendance")
    public List<Map<String, Object>> getEmployeesWithAttendance() {

        return attendanceRepository.findAll().stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("attendanceId", a.getId());
            map.put("employeeId", a.getEmployee().getId());
            map.put("name", a.getEmployee().getFirstName() + " " + a.getEmployee().getLastName());
            map.put("email", a.getEmployee().getEmail());
            map.put("department", a.getEmployee().getDepartment());
            map.put("month", a.getMonth());
            map.put("year", a.getYear());
            map.put("totalDays", a.getTotalDays());
            map.put("totalWorkingDays", a.getTotalWorkingDays());
            map.put("workedDays", a.getWorkedDays());
            return map;
        }).toList();
    }

    // =====================================================
// EMPLOYEE – Get daily attendance for a month
// =====================================================
    @GetMapping("/employee/{employeeId}/days")
    public List<String> getEmployeeAttendanceDays(
        @PathVariable Long employeeId,
        @RequestParam int month,
        @RequestParam int year) {

    LocalDate start = LocalDate.of(year, month, 1);
    LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

    return attendanceDayRepository
            .findByEmployee_IdAndDateBetween(employeeId, start, end)
            .stream()
            .map(d -> d.getDate().toString()) // yyyy-MM-dd
            .toList();
}

    // =====================================================
    // ADMIN – WEEKLY ATTENDANCE
    // =====================================================
    @GetMapping("/admin/weekly")
    public List<WeeklySummaryResponse> getWeeklyAttendance(
            @RequestParam Long employeeId,
            @RequestParam int month,
            @RequestParam int year) {

        return attendanceService.getWeeklyAttendance(employeeId, month, year);
    }

    // =====================================================
    // ADMIN – Delete Attendance
    // =====================================================
    @DeleteMapping("/admin/{attendanceId}")
    public ResponseEntity<?> deleteAttendance(
            @PathVariable Long attendanceId) {

        if (!attendanceRepository.existsById(attendanceId)) {
            return ResponseEntity.notFound().build();
        }

        attendanceRepository.deleteById(attendanceId);
        return ResponseEntity.ok().build();
    }
    // =====================================================
// ADMIN – Update Weekly Attendance
// =====================================================

    @PutMapping("/admin/weekly/update")
    public ResponseEntity<?> updateWeeklyAttendance(
        @RequestParam Long employeeId,
        @RequestParam int month,
        @RequestParam int year,
        @RequestBody WeeklyUpdateRequest request) {

    attendanceService.updateWeeklyAttendance(
            employeeId, month, year,
            request.getWeekNumber(),
            request.getWorkedDays()
    );

    return ResponseEntity.ok(
            Map.of("message", "Weekly attendance updated successfully")
    );
}

    // =====================================================
    // ADMIN – Update Attendance
    // =====================================================
    @PutMapping("/admin/update/{attendanceId}")
    public ResponseEntity<?> updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody Map<String, Object> payload) {

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));

        attendance.setWorkedDays((Integer) payload.get("workedDays"));
        attendance.getEmployee().setDepartment((String) payload.get("department"));

        attendanceRepository.save(attendance);
        return ResponseEntity.ok().build();
    }
}
