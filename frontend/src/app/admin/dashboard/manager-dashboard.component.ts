import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

/* ================================
   Interfaces
================================ */

interface EmployeeAvailability {
  attendanceId: number;
  employeeId: number;
  name: string;
  email: string;
  department: string;
  month: number;
  year: number;

  totalDays: number;
  totalWorkingDays: number;
  workedDays: number;
}

interface WeeklySummary {
  weekNumber: number;
  start: string;
  end: string;
  totalWorkingDays: number;
  workedDays: number;
  availability: number;
}

/* ================================
   Component
================================ */

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css']
})
export class ManagerDashboardComponent implements OnInit {

  /* ================================
     APIs
  ================================ */

  private API =
    'http://localhost:8080/api/attendance/admin/employees-attendance';

  private WEEK_API =
    'http://localhost:8080/api/attendance/admin/weekly';

  // ✅ ADD ONLY (weekly update)
  private WEEK_UPDATE_API =
    'http://localhost:8080/api/attendance/admin/weekly/update';

  /* ================================
     Filters
  ================================ */

  departments = ['VEDC', 'GUSS', 'IDIS', 'EMRI', 'EMSS'];

  selectedDepartment = '';
  selectedMonth = '';
  selectedYear = '';

  months = [
    { value: '01', label: 'Jan' },
    { value: '02', label: 'Feb' },
    { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' },
    { value: '05', label: 'May' },
    { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' },
    { value: '08', label: 'Aug' },
    { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' }
  ];

  years: number[] = [];

  /* ================================
     Data
  ================================ */

  employees: EmployeeAvailability[] = [];

  /* ================================
     Monthly Edit State (EXISTING)
  ================================ */

  editingEmployee: EmployeeAvailability | null = null;

  editModel = {
    department: '',
    workingDays: 0
  };

  /* ================================
     Weekly Expand State (EXISTING)
  ================================ */

  expandedEmployee: EmployeeAvailability | null = null;
  weeklyData: WeeklySummary[] = [];

  /* ================================
     Weekly Edit State (ADD ONLY)
  ================================ */

  editingWeek: number | null = null;
  editedWeekDays = 0;

  constructor(private http: HttpClient) {}

  /* ================================
     Init
  ================================ */

  ngOnInit(): void {
    this.loadEmployees();
  }

  /* ================================
     Load Monthly Data
  ================================ */

  loadEmployees(): void {
    this.http.get<EmployeeAvailability[]>(this.API).subscribe({
      next: data => {
        this.employees = data;
        this.extractYears();
      },
      error: err => {
        console.error('Admin load error:', err);
        alert('Failed to load attendance data');
      }
    });
  }

  extractYears(): void {
    this.years = Array.from(new Set(this.employees.map(e => e.year)));
  }

  filteredEmployees(): EmployeeAvailability[] {
    return this.employees.filter(emp =>
      (!this.selectedDepartment || emp.department === this.selectedDepartment) &&
      (!this.selectedMonth || emp.month === Number(this.selectedMonth)) &&
      (!this.selectedYear || emp.year === Number(this.selectedYear))
    );
  }

  /* ================================
     Helpers
  ================================ */

  getMonthName(month: number): string {
    return new Date(2000, month - 1)
      .toLocaleString('default', { month: 'short' });
  }

  availabilityPercent(emp: EmployeeAvailability): number {
    if (!emp.totalWorkingDays) return 0;
    return Math.round((emp.workedDays / emp.totalWorkingDays) * 100);
  }

  /* ================================
     Weekly Expand Logic (EXISTING)
  ================================ */

  toggleWeeks(emp: EmployeeAvailability): void {
    if (this.expandedEmployee === emp) {
      this.expandedEmployee = null;
      this.weeklyData = [];
      this.editingWeek = null;
      return;
    }

    this.expandedEmployee = emp;
    this.weeklyData = [];
    this.editingWeek = null;

    this.http.get<WeeklySummary[]>(this.WEEK_API, {
      params: {
        employeeId: emp.employeeId,
        month: emp.month,
        year: emp.year
      }
    }).subscribe({
      next: data => this.weeklyData = data,
      error: () => alert('Failed to load weekly data')
    });
  }

  /* ================================
     Monthly Edit Actions (EXISTING)
  ================================ */

  editEmployee(emp: EmployeeAvailability): void {
    this.editingEmployee = emp;
    this.editModel = {
      department: emp.department,
      workingDays: emp.workedDays
    };
  }

  saveEmployee(): void {
    if (!this.editingEmployee) return;

    const maxDays = this.editingEmployee.totalWorkingDays;

    if (this.editModel.workingDays < 1 || this.editModel.workingDays > maxDays) {
      alert(`Working days must be between 1 and ${maxDays}`);
      return;
    }

    const payload = {
      workedDays: this.editModel.workingDays,
      department: this.editModel.department
    };

    this.http.put(
      `http://localhost:8080/api/attendance/admin/update/${this.editingEmployee.attendanceId}`,
      payload
    ).subscribe({
      next: () => {
        this.editingEmployee!.workedDays = payload.workedDays;
        this.editingEmployee!.department = payload.department;
        this.editingEmployee = null;
        alert('Saved successfully');
      },
      error: () => alert('Update failed')
    });
  }

  cancelEdit(): void {
    this.editingEmployee = null;
  }

  /* ================================
     ✅ Weekly Edit Actions (ADD ONLY)
  ================================ */

  editWeek(w: WeeklySummary): void {
    this.editingWeek = w.weekNumber;
    this.editedWeekDays = w.workedDays;
  }

  cancelWeekEdit(): void {
    this.editingWeek = null;
  }

  saveWeek(w: WeeklySummary): void {
    if (!this.expandedEmployee) return;

    if (this.editedWeekDays < 0 || this.editedWeekDays > w.totalWorkingDays) {
      alert(`Worked days must be between 0 and ${w.totalWorkingDays}`);
      return;
    }

    const payload = {
      weekNumber: w.weekNumber,
      workedDays: this.editedWeekDays
    };

    this.http.put(this.WEEK_UPDATE_API, payload, {
      params: {
        employeeId: this.expandedEmployee.employeeId,
        month: this.expandedEmployee.month,
        year: this.expandedEmployee.year
      }
    }).subscribe({
      next: () => {
        this.toggleWeeks(this.expandedEmployee!); // 🔁 refresh weekly
        this.loadEmployees();                     // 🔁 refresh monthly
        alert('Weekly attendance updated');
      },
      error: () => alert('Weekly update failed')
    });
  }

  /* ================================
     Delete (EXISTING)
  ================================ */

  deleteEmployee(emp: EmployeeAvailability): void {
    if (!confirm('Delete this entry?')) return;

    this.http.delete(
      `http://localhost:8080/api/attendance/admin/${emp.attendanceId}`
    ).subscribe({
      next: () => {
        this.employees = this.employees.filter(
          e => e.attendanceId !== emp.attendanceId
        );
        alert('Deleted successfully');
      },
      error: () => alert('Delete failed')
    });
  }

  /* ================================
     Logout
  ================================ */

  logout(): void {
    sessionStorage.clear();
    window.location.href = '/login';
  }
}
