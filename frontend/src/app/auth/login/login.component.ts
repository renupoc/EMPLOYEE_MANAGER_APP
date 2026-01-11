import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login() {
  this.auth.login({
    email: this.email,
    password: this.password
  }).subscribe({
    next: (res: any) => {

      console.log('Login response:', res); // 🔍 DEBUG

      // SAVE USER
      localStorage.setItem('loggedInUser', JSON.stringify(res));

      // ROLE-BASED NAVIGATION
      if (res.role === 'ADMIN') {
        this.router.navigate(['/admin-dashboard']);
      } else if (res.role === 'EMPLOYEE') {
        this.router.navigate(['/employee-dashboard']);
      } else {
        alert('Unknown role');
      }
    },
    error: (err) => {
      console.error(err);
      alert('Invalid email or password');
    }
  });
}
}
