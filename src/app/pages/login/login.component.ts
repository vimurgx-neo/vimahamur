import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthRole } from '../../shared/models/auth.model';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;

import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  protected isRegisterMode = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  protected isSubmitting = signal(false);

  protected logout(): void {
    this.authService.logout();
    this.errorMessage.set(null);
    this.notificationService.showInfo('Signed Out', 'You have been signed out cleanly.');
  }

  // Login Form Model
  protected credentials = {
    email: '',
    password: '',
    rememberMe: false,
    role: 'Customer' as AuthRole
  };

  // Sign Up Form Model
  protected registerData = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  ngOnInit(): void {
    const path = this.router.url;
    if (path.includes('register') || path.includes('signup')) {
      this.isRegisterMode.set(true);
    }
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    const checkGsi = () => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        try {
          google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (response: any) => this.handleGoogleCredential(response.credential),
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          const btnContainer = document.getElementById('google-signin-btn');
          if (btnContainer) {
            btnContainer.innerHTML = '';
            google.accounts.id.renderButton(btnContainer, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('Google Sign-In initialization deferred', e);
        }
      } else {
        setTimeout(checkGsi, 100);
      }
    };
    checkGsi();
  }

  protected handleGoogleCredential(token: string): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    
    this.authService.loginWithGoogle(token).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.notificationService.showSuccess('Welcome Back! ✨', `Logged in as ${res.userName || res.email}`);
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message ?? 'Google authentication failed.';
        this.errorMessage.set(msg);
        this.notificationService.showError('Authentication Error', msg);
      }
    });
  }

  protected setMode(register: boolean): void {
    this.isRegisterMode.set(register);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected submitLogin(): void {
    const email = this.credentials.email.trim();
    const password = this.credentials.password;

    if (!email || !password) {
      const msg = 'Please enter both email and password.';
      this.errorMessage.set(msg);
      this.notificationService.showError('Validation Error', msg);
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.login({ ...this.credentials, email }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.notificationService.showSuccess('Welcome! 🌟', `Signed in successfully as ${res.userName || res.email}`);
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message ?? 'Invalid email or password.';
        this.errorMessage.set(msg);
        this.notificationService.showError('Sign In Failed', msg);
      }
    });
  }

  protected submitRegister(): void {
    const name = this.registerData.name.trim();
    const email = this.registerData.email.trim();
    const phone = this.registerData.phone.trim();
    const password = this.registerData.password;
    const confirm = this.registerData.confirmPassword;

    if (!name || !email || !password) {
      const msg = 'Please fill in all required fields (Name, Email, Password).';
      this.errorMessage.set(msg);
      this.notificationService.showError('Validation Error', msg);
      return;
    }

    if (password !== confirm) {
      const msg = 'Passwords do not match.';
      this.errorMessage.set(msg);
      this.notificationService.showError('Password Mismatch', msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      this.errorMessage.set(msg);
      this.notificationService.showError('Password Too Short', msg);
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.register({
      name,
      email,
      phone,
      password
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.notificationService.showSuccess('Account Created! 🎉', 'Welcome to Vimahamur Luxury Properties.');
        setTimeout(() => {
          this.redirectByRole(res.role);
        }, 600);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message ?? 'Registration failed. Please check your details.';
        this.errorMessage.set(msg);
        this.notificationService.showError('Registration Failed', msg);
      }
    });
  }

  private redirectByRole(role: AuthRole | null): void {
    if (role === 'Admin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
