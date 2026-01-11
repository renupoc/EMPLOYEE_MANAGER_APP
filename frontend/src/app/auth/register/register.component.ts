import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  firstName = '';
  lastName = '';
  email = '';
  department = '';
  password = '';
  confirmPassword = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  register(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      alert('All fields are required');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.auth.register({
  firstName: this.firstName,
  lastName: this.lastName,
  email: this.email,
  department: this.department,
  password: this.password
}).subscribe({
  next: () => {
    alert('Registration successful');
    this.router.navigate(['/login']);
  },
  error: (err: any) => {   // ✅ FIXED
    console.error(err);
    alert('Registration failed');
  }
});
  }
}
