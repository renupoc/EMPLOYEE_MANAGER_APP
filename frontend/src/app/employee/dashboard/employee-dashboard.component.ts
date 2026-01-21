import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import { EmployeeService } from '../../core/services/employee.service';

interface CalendarDay {
  date: Date;
  day: number;
  isWeekend: boolean;
  isSelected: boolean;
}

interface WeekSummary {
  weekNumber: number;
  start: Date;
  end: Date;
  totalWorkingDays: number;
  selectedDays: number;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {

  user: any;

  months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 }
  ];

  years: number[] = [];
  weeks: WeekSummary[] = [];

  // ✅ FIXED TYPES
  selectedMonth: number | null = null;
  selectedYear: number | null = null;

  daysInMonth = 0;
  weekdaysInMonth = 0;
  workedDays = 0;

  calendarDays: CalendarDay[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit(): void {
    this.generateYears();

    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      return;
    }

    alert('Session expired. Please login again.');
    this.logout();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);
  }

  onMonthOrYearChange() {
    if (this.selectedMonth === null || this.selectedYear === null) return;

    this.daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth,
      0
    ).getDate();

    this.weekdaysInMonth = this.calculateWeekdays(
      this.selectedYear,
      this.selectedMonth
    );

    this.generateCalendar();
    this.generateWeeks();
    this.workedDays = 0;

    // ✅ LOAD SAVED DATES FROM DB
this.attendanceService
  .getSelectedDates(this.user.employeeId, this.selectedMonth, this.selectedYear)
  .subscribe(savedDates => {
    this.applySavedDates(savedDates);
  });
  }

  generateWeeks() {
  if (this.selectedMonth === null || this.selectedYear === null) return;

  this.weeks = [];

  const year = this.selectedYear;
  const month = this.selectedMonth;
  const totalDays = new Date(year, month, 0).getDate();

  let weekNumber = 1;
  let weekStartDay = 1;

  while (weekStartDay <= totalDays) {
    const startDate = new Date(year, month - 1, weekStartDay,  0, 0, 0);

    let weekEndDay = weekStartDay;
    let d = new Date(startDate);

    // Week ends on Sunday OR month end
    while (
      d.getDay() !== 0 &&           // Sunday
      weekEndDay < totalDays
    ) {
      weekEndDay++;
      d = new Date(year, month - 1, weekEndDay);
    }

    const endDate = new Date(year, month - 1, weekEndDay,  23, 59, 59 );

    // Count working days (Mon–Fri only)
    let totalWorkingDays = 0;
    for (let day = weekStartDay; day <= weekEndDay; day++) {
      const temp = new Date(year, month - 1, day);
      const dow = temp.getDay();
      if (dow !== 0 && dow !== 6) {
        totalWorkingDays++;
      }
    }

    this.weeks.push({
      weekNumber,
      start: startDate,
      end: endDate,
      totalWorkingDays,
      selectedDays: 0
    });

    weekNumber++;
    weekStartDay = weekEndDay + 1;
  }
}

applySavedDates(savedDates: string[]) {
  const savedSet = new Set(savedDates);

  this.calendarDays.forEach(day => {
    if (day.day === 0) return; // skip empty cells

    const y = day.date.getFullYear();
    const m = String(day.date.getMonth() + 1).padStart(2, '0');
    const d = String(day.date.getDate()).padStart(2, '0');
    const localDate = `${y}-${m}-${d}`;
    day.isSelected = savedSet.has(localDate);
  });
   // 🔁 Recalculate weekly & monthly counts
  this.calculateWorkedDays();
}

  generateCalendar() {
  if (this.selectedMonth === null || this.selectedYear === null) return;

  this.calendarDays = [];

  const firstDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
  const totalDays = new Date(this.selectedYear, this.selectedMonth, 0).getDate();

  // JS: 0=Sun → convert to Mon=0
  let startOffset = firstDate.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  // Empty cells before first day
  for (let i = 0; i < startOffset; i++) {
    this.calendarDays.push({
      date: new Date(),
      day: 0,
      isWeekend: true,
      isSelected: false
    });
  }

  // Actual days
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(this.selectedYear, this.selectedMonth - 1, d, 12, 0, 0);
    const dayOfWeek = date.getDay();

    this.calendarDays.push({
      date,
      day: d,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isSelected: false
    });
  }
}



  toggleDay(day: CalendarDay) {
    if (day.isWeekend) return;

    day.isSelected = !day.isSelected;
    this.calculateWorkedDays();
  }

  calculateWorkedDays() {
  this.workedDays = 0;

  // reset weekly counts
  this.weeks.forEach(w => (w.selectedDays = 0));

  this.calendarDays.forEach(day => {
    if (day.isSelected && !day.isWeekend) {
      this.workedDays++;

      const week = this.weeks.find(w =>
        day.date >= w.start && day.date <= w.end
      );

      if (week) {
        week.selectedDays++;
      }
    }
  });
}

  isFormValid() {
    return (
      this.selectedMonth !== null &&
      this.selectedYear !== null &&
      this.workedDays > 0
    );
  }

  submit() {
    if (this.selectedMonth === null || this.selectedYear === null) return;

    const selectedDates = this.calendarDays
      .filter(d => d.isSelected && !d.isWeekend)
      .map(d => {
        const y = d.date.getFullYear();
        const m = String(d.date.getMonth() + 1).padStart(2, '0');
        const day = String(d.date.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
  });

    // ✅ BACKEND-COMPATIBLE PAYLOAD
    const payload = {
      month: this.selectedMonth,
      year: this.selectedYear,
      totalDays: this.daysInMonth,
      totalWorkingDays: this.weekdaysInMonth,
      workedDays: this.workedDays,
      selectedDates
    };

    this.attendanceService
      .submitAttendance(this.user.employeeId, payload)
      .subscribe({
        next: () => alert('Attendance submitted successfully'),
        error: () => alert('Submit failed')
      });
  }

  logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login';
  }

  calculateWeekdays(year: number, month: number): number {
    let count = 0;
    const totalDays = new Date(year, month, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }
}
