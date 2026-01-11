package com.example.attendance.service;

import com.example.attendance.entity.Employee;
import com.example.attendance.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    public Employee getEmployee(Long id) {
        return employeeRepository.findById(id).orElseThrow();
    }

    public Employee updateEmployee(Long id, Employee updated) {
    Employee emp = employeeRepository.findById(id)
            .orElseThrow();

    emp.setFirstName(updated.getFirstName());
    emp.setLastName(updated.getLastName());
    emp.setDepartment(updated.getDepartment());

    return employeeRepository.save(emp);
}
}
