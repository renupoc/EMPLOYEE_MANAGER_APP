package com.example.attendance.service;

import com.example.attendance.dto.AttendanceRequest;
import com.example.attendance.entity.Attendance;
import com.example.attendance.entity.Employee;
import com.example.attendance.repository.AttendanceRepository;
import com.example.attendance.repository.EmployeeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    // ================================
    // Submit attendance
    // ================================
    public void submitAttendance(Long employeeId, AttendanceRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee); // ✅ CORRECT
        attendance.setMonth(request.getMonth());
        attendance.setYear(request.getYear());
        attendance.setTotalDays(request.getTotalDays());
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
}
