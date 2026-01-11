package com.example.attendance.service;

import com.example.attendance.dto.LoginRequest;
import com.example.attendance.dto.RegisterRequest;
import com.example.attendance.entity.Employee;
import com.example.attendance.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final EmployeeRepository employeeRepository;

    public AuthService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // REGISTER
    public Employee register(RegisterRequest request) {

        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Employee emp = new Employee();
        emp.setFirstName(request.getFirstName());
        emp.setLastName(request.getLastName());
        emp.setFullName(request.getFirstName() + " " + request.getLastName());
        emp.setEmail(request.getEmail());
        emp.setPassword(request.getPassword());
        emp.setDepartment(request.getDepartment());
        emp.setRole("EMPLOYEE");

        return employeeRepository.save(emp);
    }

    // LOGIN
    public Map<String, Object> login(LoginRequest request) {
        System.out.println(request.getEmail()+request.getPassword());
        Employee employee = employeeRepository
                .findByEmail(request.getEmail())
                .filter(e -> e.getPassword().equals(request.getPassword()))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        Map<String, Object> response = new HashMap<>();
        response.put("employeeId", employee.getId());
        response.put("fullName", employee.getFullName());
        response.put("email", employee.getEmail());
        response.put("department", employee.getDepartment());
        response.put("role", employee.getRole());

        return response;
    }
}
