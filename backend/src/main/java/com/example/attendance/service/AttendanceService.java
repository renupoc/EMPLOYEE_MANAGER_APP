package com.example.attendance.service;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.dto.WeeklySummaryResponse;
import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.AttendanceDay;
import com.example.attendance.entity.Employee;
import com.example.attendance.repository.AttendanceDayRepository;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceDayRepository attendanceDayRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            AttendanceDayRepository attendanceDayRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceDayRepository = attendanceDayRepository;
    }

    // ================================
    // Submit attendance (MONTHLY)
    // ================================
    public void submitAttendance(Long employeeId, AttendanceRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndMonthAndYear(
                        employeeId,
                        request.getMonth(),
                        request.getYear()
                )
                .orElse(new Attendance());

        attendance.setEmployee(employee);
        attendance.setMonth(request.getMonth());
        attendance.setYear(request.getYear());
        attendance.setTotalDays(request.getTotalDays());
        attendance.setTotalWorkingDays(request.getTotalWorkingDays());
        attendance.setWorkedDays(request.getWorkedDays());

        attendanceRepository.save(attendance);
    }

    // ================================
    // Get attendance by employee
    // ================================
    public List<Attendance> getAttendanceByEmployee(Long employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }

    // ================================
    // Admin - get all attendance
    // ================================
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // =====================================================
    // ✅ ADMIN – UPDATE WEEKLY ATTENDANCE (NEW)
    // =====================================================
    public void updateWeeklyAttendance(
        Long employeeId,
        int month,
        int year,
        int weekNumber,
        int workedDays
) {
    YearMonth ym = YearMonth.of(year, month);
    int totalDays = ym.lengthOfMonth();

    int currentWeek = 1;
    int weekStartDay = 1;

    Employee employee = employeeRepository
            .findById(employeeId)
            .orElseThrow(() -> new RuntimeException("Employee not found"));

    while (weekStartDay <= totalDays) {

        LocalDate startDate = LocalDate.of(year, month, weekStartDay);
        LocalDate endDate = startDate;

        while (endDate.getDayOfWeek() != DayOfWeek.SUNDAY
                && endDate.getDayOfMonth() < totalDays) {
            endDate = endDate.plusDays(1);
        }

        if (currentWeek == weekNumber) {

            // 🔥 DELETE existing days for this week
            attendanceDayRepository
                    .findByEmployee_IdAndDateBetween(employeeId, startDate, endDate)
                    .forEach(attendanceDayRepository::delete);

            // 🔥 RE-INSERT PRESENT days (Mon–Fri only)
            int count = 0;
            LocalDate cursor = startDate;

            while (!cursor.isAfter(endDate) && count < workedDays) {
                DayOfWeek dow = cursor.getDayOfWeek();

                if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                    AttendanceDay day = new AttendanceDay();
                    day.setEmployee(employee);
                    day.setDate(cursor);
                    day.setStatus("PRESENT");
                    attendanceDayRepository.save(day);
                    count++;
                }
                cursor = cursor.plusDays(1);
            }

            return;
        }

        currentWeek++;
        weekStartDay = endDate.getDayOfMonth() + 1;
    }

    throw new RuntimeException("Invalid week number");
}


    // =====================================================
    // ✅ ADMIN – WEEKLY ATTENDANCE SUMMARY
    // =====================================================
    public List<WeeklySummaryResponse> getWeeklyAttendance(
            Long employeeId, int month, int year) {

        List<WeeklySummaryResponse> result = new ArrayList<>();

        YearMonth ym = YearMonth.of(year, month);
        int totalDays = ym.lengthOfMonth();

        int weekNumber = 1;
        int weekStartDay = 1;

        while (weekStartDay <= totalDays) {

            LocalDate startDate = LocalDate.of(year, month, weekStartDay);
            LocalDate endDate = startDate;

            while (endDate.getDayOfWeek() != DayOfWeek.SUNDAY
                    && endDate.getDayOfMonth() < totalDays) {
                endDate = endDate.plusDays(1);
            }

            int totalWorkingDays = 0;
            int workedDays = 0;

            LocalDate temp = startDate;
            while (!temp.isAfter(endDate)) {

                DayOfWeek dow = temp.getDayOfWeek();
                if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {

                    totalWorkingDays++;

                    boolean present =
                            attendanceDayRepository
                                    .existsByEmployee_IdAndDate(employeeId, temp);

                    if (present) {
                        workedDays++;
                    }
                }
                temp = temp.plusDays(1);
            }

            WeeklySummaryResponse w = new WeeklySummaryResponse();
            w.setWeekNumber(weekNumber++);
            w.setStart(startDate);
            w.setEnd(endDate);
            w.setTotalWorkingDays(totalWorkingDays);
            w.setWorkedDays(workedDays);
            w.setAvailability(
                    totalWorkingDays == 0 ? 0 : (workedDays * 100) / totalWorkingDays
            );

            result.add(w);
            weekStartDay = endDate.getDayOfMonth() + 1;
        }

        return result;
    }
}
