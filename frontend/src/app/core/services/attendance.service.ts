import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private baseUrl = 'http://localhost:8080/api/attendance';

  constructor(private http: HttpClient) {}

  // ================================
  // EMPLOYEE – Submit Attendance
  // ================================
  submitAttendance(employeeId: number, payload: AttendancePayload): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/submit/${employeeId}`,
      payload
    );
  }

  // ================================
  // EMPLOYEE – Get own attendance
  // ================================
  getAttendanceByEmployee(employeeId: number): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(
      `${this.baseUrl}/employee/${employeeId}`
    );
  }

  // ================================
  // ADMIN – Get ALL attendance
  // ================================
  getAllAttendance(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(
      `${this.baseUrl}/admin/all`
    );
  }

  getSelectedDates(employeeId: number, month: number, year: number) {
  return this.http.get<string[]>(
    `http://localhost:8080/api/attendance/employee/${employeeId}/days`,
    { params: { month, year } }
  );
}
}

/* ===================================
   Interfaces (Strong Typing)
=================================== */

export interface AttendancePayload {
  month: number;
  year: number;
  totalDays: number;
  workedDays: number;
}

export interface Attendance {
  id: number;
  month: number;
  year: number;
  totalDays: number;
  workingDays: number;
  createdAt: string;

  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
}
