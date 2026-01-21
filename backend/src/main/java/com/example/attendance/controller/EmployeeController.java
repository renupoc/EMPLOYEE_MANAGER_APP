package com.example.attendance.controller;

import com.example.attendance.entity.Employee;
import com.example.attendance.repository.EmployeeRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:4200")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    public EmployeeController(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // ✅ PROFILE API (USED BY FRONTEND)
    @GetMapping("/by-email/{email}")
    public Employee getEmployeeProfile(@PathVariable Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    

    // ✅ UPDATE DEPARTMENT
    @PutMapping("/{id}/department")
    public Employee updateDepartment(
            @PathVariable Long id,
            @RequestBody Employee request) {

        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        emp.setDepartment(request.getDepartment());
        return employeeRepository.save(emp);
    }
}
