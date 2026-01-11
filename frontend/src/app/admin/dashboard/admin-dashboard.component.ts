import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';


interface EmployeeAvailability {
  employeeId: number;
  name: string;
  email: string;
  department: string;
  month: number;
  year: number;

  totalDays: number;          // calendar days
  totalWorkingDays: number;   // weekdays only
  workedDays: number;         // employee input
}




@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  private API = 'http://localhost:8080/api/attendance/admin/employees-attendance';


  departments = ['VEDC', 'GUSS', 'IDIS', 'EMRI'];

  // 🔹 Filters
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

  employees: EmployeeAvailability[] = [];

  // 🔹 Edit state
  editingEmployee: EmployeeAvailability | null = null;

  editModel = {
    department: '',
    workingDays: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  /* ===== LOAD FROM DB ===== */

  loadEmployees(): void {
    this.http
        .get<EmployeeAvailability[]>(this.API)
        .subscribe({
          next: (data) => {
            this.employees = data;
            this.extractYears();
          },
          error: (err) => {
            console.error('Admin load error:', err);
            alert('Failed to load attendance data');
          }
        });
  }


  extractYears(): void {
    this.years = Array.from(
        new Set(this.employees.map(e => e.year))
    );
  }


  filteredEmployees(): EmployeeAvailability[] {
    return this.employees.filter(emp => {
      return (
          (!this.selectedDepartment || emp.department === this.selectedDepartment) &&
          (!this.selectedMonth || emp.month === Number(this.selectedMonth)) &&
          (!this.selectedYear || emp.year === Number(this.selectedYear))
      );
    });
  }


  /* ===== Helpers ===== */

  getMonthName(month: number): string {
    return new Date(2000, month - 1)
        .toLocaleString('default', { month: 'short' });
  }

  availabilityPercent(emp: EmployeeAvailability): number {
    if (!emp.totalWorkingDays) return 0;
    return Math.round((emp.workedDays / emp.totalWorkingDays) * 100);
  }



  getYear(month: string): string {
    return month.split('-')[0];
  }

  getDaysInMonth(month: string): number {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m, 0).getDate();
  }

  /* ===== Actions ===== */

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


    if (
        this.editModel.workingDays < 1 ||
        this.editModel.workingDays > maxDays
    ) {
      alert(`Working days must be between 1 and ${maxDays}`);
      return;
    }

    const payload = {
      employeeId: this.editingEmployee.employeeId,
      month: this.editingEmployee.month,
      year: this.editingEmployee.year,
      department: this.editModel.department,
      workedDays: this.editModel.workingDays

    };

    this.http
        .put(
            `http://localhost:8080/api/attendance/admin/update/${payload.employeeId}`,
            payload
        )
        .subscribe({
          next: () => {
            Object.assign(this.editingEmployee!, payload);
            this.editingEmployee = null;
            alert('Saved successfully');
          },
          error: (err) => {
            console.error('Update failed:', err);
            alert('Update failed');
          }
        });
  }


  cancelEdit(): void {
    this.editingEmployee = null;
  }

  deleteEmployee(emp: EmployeeAvailability): void {
    if (!confirm('Delete this entry?')) return;

    this.http.delete(`${this.API}/${emp.employeeId}`).subscribe({
      next: () => {
        this.employees = this.employees.filter(e => e.employeeId !== emp.employeeId);
        this.extractYears();
      },
      error: (err) => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  logout(): void {
    sessionStorage.clear();
    window.location.href = '/login';
  }

  
}
