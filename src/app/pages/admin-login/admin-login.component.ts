import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AuthRole } from '../../shared/models/auth.model';

import { NotificationService } from '../../shared/services/notification.service';

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
  private readonly notificationService = inject(NotificationService);

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
    if (this.authService.isAuthenticated() && role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  protected submitLogin(): void {
    const email = this.credentials.email.trim();
    const password = this.credentials.password;

    if (!email || !password) {
      const msg = 'Please enter both administrator email and access key.';
      this.errorMessage.set(msg);
      this.notificationService.showError('Validation Required', msg);
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.login({ ...this.credentials, email }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.role === 'Admin') {
          this.notificationService.showSuccess('Admin Verified! 🛡️', 'Welcome to the Vimahamur Management Console.');
          this.router.navigate(['/admin/dashboard']);
        } else {
          const msg = 'Access Denied: This portal requires administrator privileges.';
          this.errorMessage.set(msg);
          this.notificationService.showError('Access Denied', msg);
          this.authService.logout();
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message ?? 'Invalid administrator credentials.';
        this.errorMessage.set(msg);
        this.notificationService.showError('Authentication Failed', msg);
      }
    });
  }
}
