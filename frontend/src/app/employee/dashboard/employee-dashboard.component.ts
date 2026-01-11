import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../core/services/attendance.service';
import {EmployeeService} from "../../core/services/employee.service";

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {

  user: any = {};

  departments = ['VEDC', 'GUSS', 'EMSS'];
  selectedDepartment = '';

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
  selectedMonth: number | '' = '';
  selectedYear: number | '' = '';

  daysInMonth = 0;
  workingDays = 0;
  showError = false;
  weekdaysInMonth = 0; // ✅ excludes Sat & Sun


  constructor(
      private attendanceService: AttendanceService,
      private employeeService: EmployeeService
  ) {}


  ngOnInit(): void {
    this.generateYears();

    const state = history.state;

    // 1️⃣ First priority: navigation state
    if (state?.email) {
      this.employeeService.getByEmail(state.email).subscribe({
        next: (res: any) => {
          this.user = res;
          this.selectedDepartment = res.department;

          // Cache user (without password)
          const { password, ...cacheableUser } = res;
          localStorage.setItem('loggedInUser', JSON.stringify(cacheableUser));
        },
        error: () => {
          alert('Failed to load profile');
          this.logout();
        }
      });
      return;
    }

    // 2️⃣ Second priority: localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
      console.log(this.user)
      this.selectedDepartment = this.user.department;
      return;
    }

    // 3️⃣ Only now → session expired
    alert('Session expired. Please login again.');
    this.logout();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 100 }, (_, i) => currentYear - 5 + i);
  }

  onMonthOrYearChange() {
    if (this.selectedMonth && this.selectedYear) {

      this.daysInMonth = new Date(
          this.selectedYear,
          this.selectedMonth,
          0
      ).getDate();

      // ✅ NEW: weekdays only
      this.weekdaysInMonth = this.calculateWeekdays(
          this.selectedYear,
          this.selectedMonth
      );

      this.workingDays = 0;
      this.showError = false;
    }
  }


  validateWorkingDays() {
    if (this.workingDays > this.weekdaysInMonth) {
      this.showError = true;
      this.workingDays = this.weekdaysInMonth;
    } else {
      this.showError = false;
    }
  }


  isFormValid() {
    return (
        this.selectedDepartment &&
        this.selectedMonth &&
        this.selectedYear &&
        this.workingDays > 0 &&
        this.workingDays <= this.weekdaysInMonth
    );
  }


  // ================================
  // ✅ FIXED SUBMIT METHOD (BACKEND)
  // ================================
 submit() {

  if (!this.selectedMonth || !this.selectedYear) {
    alert('Please select month and year');
    return;
  }

   const attendanceDate = new Date(this.selectedYear!, this.selectedMonth! - 1, 1);

   const payload = {
     month: this.selectedMonth,
     year: this.selectedYear,
     totalDays: this.daysInMonth,
     totalWorkingDays: this.weekdaysInMonth,
     workedDays: this.workingDays,
     availabilityPercent: Math.round((this.workingDays / this.daysInMonth) * 100), // ✅ Integer
     attendanceDate: attendanceDate.toISOString().split('T')[0],
     status: 'SUBMITTED'
   };

  this.attendanceService
    .submitAttendance(this.user.employeeId, payload)
    .subscribe({
      next: () => {
        alert('Attendance submitted successfully');
      },
      error: err => {
        console.error(err);
        alert('Submit failed');
      }
    });
}

  logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = '/login';
  }

  calculateWeekdays(year: number, month: number): number {
    let count = 0;
    const totalDays = new Date(year, month, 0).getDate();

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }

    return count;
  }

}

