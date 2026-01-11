import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    // ✅ NO localStorage here
    return this.http.post<any>(`${this.API}/login`, data);
  }
}
