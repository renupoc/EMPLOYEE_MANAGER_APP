import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminLoginComponent } from './admin/login/admin-login.component';
import { ManagerDashboardComponent } from './admin/dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './employee/dashboard/employee-dashboard.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin-dashboard', component: ManagerDashboardComponent },
  { path: 'employee-dashboard', component: EmployeeDashboardComponent },
  { path: '**', redirectTo: 'login' }
];
