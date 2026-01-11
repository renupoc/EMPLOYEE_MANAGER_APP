package com.example.attendance.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MonitoringController {

    // GET /hello
    @GetMapping("/hello")
    public String hello() {
        return "Employee Attendance Backend is running";
    }

    // GET /health
    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "employee-attendance-backend");
        return status;
    }
}
