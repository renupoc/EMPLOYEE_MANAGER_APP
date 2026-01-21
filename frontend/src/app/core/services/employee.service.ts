import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private EMPLOYEE_API = 'http://localhost:8080/api/employees';
  private ATTENDANCE_API = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  // ✅ Get employee by ID (USED BY DASHBOARD)
  getById(id: number): Observable<any> {
    return this.http.get(`${this.EMPLOYEE_API}/${id}`);
  }
  

  // ❌ (Optional) remove if unused
  getByEmail(email: string): Observable<any> {
    return this.http.get(`${this.EMPLOYEE_API}/by-email/${email}`);
  }

  // ✅ Update department
  updateDepartment(id: number, department: string): Observable<any> {
    return this.http.put(
      `${this.EMPLOYEE_API}/${id}/department`,
      { department }
    );
  }

  // ✅ Save attendance for logged-in employee
  saveAttendance(employeeId: number, payload: any): Observable<any> {
    return this.http.post(
      `${this.ATTENDANCE_API}/${employeeId}`,
      payload
    );
  }

  // ✅ Get attendance for logged-in employee
  getAttendance(employeeId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.ATTENDANCE_API}/${employeeId}`
    );
  }
}
