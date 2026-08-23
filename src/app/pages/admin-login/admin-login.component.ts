import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AuthRole } from '../../shared/models/auth.model';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected credentials = {
    email: '',
    password: '',
    rememberMe: true,
    role: 'Admin' as AuthRole
  };

  protected showPassword = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected isSubmitting = signal(false);

  ngOnInit(): void {
    const role = this.authService.currentRole();
    if (this.authService.isAuthenticated() && (role === 'Admin' || role === 'SuperAdmin')) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  protected fillDemo(role: 'superadmin' | 'admin'): void {
    if (role === 'superadmin') {
      this.credentials.email = 'superadmin@vimahamur.local';
      this.credentials.password = 'ChangeMe!12345';
      this.credentials.role = 'SuperAdmin';
    } else {
      this.credentials.email = 'admin@vimahamur.local';
      this.credentials.password = 'ChangeMe!12345';
      this.credentials.role = 'Admin';
    }
    this.errorMessage.set(null);
    this.submitLogin();
  }

  protected submitLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Please enter both administrator email and access key.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.role === 'Admin' || res.role === 'SuperAdmin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage.set('Access Denied: This portal requires administrator or executive privileges.');
          this.authService.logout();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Invalid administrator credentials.');
      }
    });
  }
}
