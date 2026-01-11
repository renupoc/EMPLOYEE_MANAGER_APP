import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {

        // 🔐 ROLE CHECK
        if (res.role !== 'ADMIN') {
          alert('Access denied. Admin only.');
          return;
        }

        // ✅ STORE FULL ADMIN OBJECT (BEST PRACTICE)
        localStorage.setItem('loggedInUser', JSON.stringify(res));

        // ✅ USE employeeId (NOT id)
        localStorage.setItem('adminId', res.employeeId.toString());

        // ✅ REDIRECT
        this.router.navigate(['/admin-dashboard']);
      },
      error: () => {
        alert('Invalid email or password');
      }
    });
  }
}
