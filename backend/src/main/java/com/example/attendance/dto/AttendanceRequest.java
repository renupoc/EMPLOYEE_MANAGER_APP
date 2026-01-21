package com.example.attendance.dto;
import java.util.List;

public class AttendanceRequest {

    private int month;
    private int year;
    

    // ✅ Total calendar days (28–31)
    private int totalDays;

    // ✅ Total weekdays (Mon–Fri)
    private int totalWorkingDays;

    // ✅ Employee worked days
    private int workedDays;
    private List<String> selectedDates;

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(int totalDays) {
        this.totalDays = totalDays;
    }

    public int getTotalWorkingDays() {
        return totalWorkingDays;
    }

    public void setTotalWorkingDays(int totalWorkingDays) {
        this.totalWorkingDays = totalWorkingDays;
    }

    public int getWorkedDays() {
        return workedDays;
    }

    public void setWorkedDays(int workedDays) {
        this.workedDays = workedDays;
    }
    // ✅ GETTER
    public List<String> getSelectedDates() {
        return selectedDates;
    }

    // ✅ SETTER
    public void setSelectedDates(List<String> selectedDates) {
        this.selectedDates = selectedDates;
    }
}
