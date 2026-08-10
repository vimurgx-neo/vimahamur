import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AuthRole } from '../../shared/models/auth.model';

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

  protected isRegisterMode = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  protected isSubmitting = signal(false);

  protected logout(): void {
    this.authService.logout();
    this.errorMessage.set(null);
    this.successMessage.set('Signed out cleanly.');
  }

  // Login Form Model
  protected credentials = {
    email: '',
    password: '',
    rememberMe: false,
    role: 'Admin' as AuthRole
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
    // Check if route or query indicates register mode
    const path = this.router.url;
    if (path.includes('register') || path.includes('signup')) {
      this.isRegisterMode.set(true);
    }
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    const checkGsi = () => {
      const googleObj = (window as any).google;
      if (googleObj && googleObj.accounts && googleObj.accounts.id) {
        googleObj.accounts.id.initialize({
          client_id: '1047124976722-1o68smn1m9lqclg0v2178619.apps.googleusercontent.com',
          callback: (response: any) => this.handleGoogleCredential(response.credential),
          auto_select: false,
          cancel_on_tap_outside: true
        });
        
        const btnContainer = document.getElementById('google-signin-btn');
        if (btnContainer) {
          googleObj.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.clientWidth || 300,
            text: 'signin_with',
            shape: 'rectangular'
          });
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
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Google authentication failed.');
      }
    });
  }

  protected setMode(register: boolean): void {
    this.isRegisterMode.set(register);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected fillDemoUser(type: 'superadmin' | 'admin' | 'customer'): void {
    if (type === 'superadmin') {
      this.credentials.email = 'superadmin@vimahamur.local';
      this.credentials.password = 'ChangeMe!12345';
      this.credentials.role = 'SuperAdmin';
    } else if (type === 'admin') {
      this.credentials.email = 'admin@vimahamur.local';
      this.credentials.password = 'ChangeMe!12345';
      this.credentials.role = 'Admin';
    } else {
      this.credentials.email = 'customer@vimahamur.local';
      this.credentials.password = 'ChangeMe!12345';
      this.credentials.role = 'Customer';
    }
    this.errorMessage.set(null);
    this.submitLogin();
  }

  protected submitLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage.set('Please enter both email and password.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.redirectByRole(res.role);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Invalid email or password.');
      }
    });
  }

  protected submitRegister(): void {
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    if (this.registerData.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    this.authService.register({
      name: this.registerData.name,
      email: this.registerData.email,
      phone: this.registerData.phone,
      password: this.registerData.password
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('Account created successfully! Welcome to Vimahamur Luxury Property.');
        setTimeout(() => {
          this.redirectByRole(res.role);
        }, 800);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message ?? 'Registration failed. Please check your details.');
      }
    });
  }

  private redirectByRole(role: AuthRole | null): void {
    if (role === 'Admin' || role === 'SuperAdmin') {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
