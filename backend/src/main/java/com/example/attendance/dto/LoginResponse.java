package com.example.attendance.dto;

public class LoginResponse {

    private Long employeeId;
    private String name;
    private String email;
    private String department;

    public LoginResponse(Long employeeId, String name, String email, String department) {
        this.employeeId = employeeId;
        this.name = name;
        this.email = email;
        this.department = department;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getDepartment() {
        return department;
    }
}
