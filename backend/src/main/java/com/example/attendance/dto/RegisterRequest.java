package com.example.attendance.dto;

public class RegisterRequest {

    public String firstName;
    public String lastName;
    public String email;
    public String password;
    public String department;

      // ===== getters & setters =====

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }   

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }   

    public String getEmail() {
        return email;
    }   

    public void setEmail(String email) {
        this.email = email;
    }   

    public String getPassword() {
        return password;
    }   

    public void setPassword(String password) {
        this.password = password;
    }   

    public String getDepartment() {
        return department;
    }   

    public void setDepartment(String department) {
        this.department = department;
    }
}
