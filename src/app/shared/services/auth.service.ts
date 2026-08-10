import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'estateos-auth-user';

  readonly currentUser = signal<AuthResponse | null>(this.readStoredUser());
  readonly currentRole = computed(() => this.currentUser()?.role ?? null);
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.currentUser()?.userName);

  constructor() {
    if (this.currentUser()?.token) {
      this.refreshProfile();
    }
  }

  refreshProfile(): void {
    this.http.get<AuthResponse>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        const isRemembered = localStorage.getItem(this.storageKey) !== null;
        this.saveUser(user, isRemembered);
      },
      error: () => {
        this.logout();
      }
    });
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((user) => {
        this.saveUser(user, payload.rememberMe ?? false);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((user) => {
        this.saveUser(user, true); // Keep customer logged in on register
      }),
    );
  }

  loginWithGoogle(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, { token }).pipe(
      tap((user) => {
        this.saveUser(user, true);
      }),
    );
  }

  forgotPassword(email: string): Observable<{ message: string; token?: string }> {
    return this.http.post<{ message: string; token?: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, password });
  }

  updateProfile(payload: { name: string; email: string; phone?: string; password?: string }): Observable<{ message: string; data: any }> {
    return this.http.put<{ message: string; data: any }>(`${environment.apiUrl}/auth/profile`, payload).pipe(
      tap((res) => {
        const current = this.currentUser();
        if (current) {
          const updated = {
            ...current,
            userName: res.data.name,
            email: res.data.email,
            phone: res.data.phone
          };
          this.saveUser(updated, localStorage.getItem(this.storageKey) !== null);
        }
      })
    );
  }

  addToSavedProperties(propertyId: string): Observable<{ message: string; data: any[] }> {
    return this.http.post<{ message: string; data: any[] }>(`${environment.apiUrl}/auth/profile/saved-properties`, { propertyId }).pipe(
      tap((res) => {
        const current = this.currentUser();
        if (current) {
          const updated = { ...current, savedProperties: res.data };
          this.saveUser(updated, localStorage.getItem(this.storageKey) !== null);
        }
      })
    );
  }

  removeFromSavedProperties(propertyId: string): Observable<{ message: string; data: any[] }> {
    return this.http.delete<{ message: string; data: any[] }>(`${environment.apiUrl}/auth/profile/saved-properties/${propertyId}`).pipe(
      tap((res) => {
        const current = this.currentUser();
        if (current) {
          const updated = { ...current, savedProperties: res.data };
          this.saveUser(updated, localStorage.getItem(this.storageKey) !== null);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    sessionStorage.removeItem(this.storageKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return this.currentUser()?.token ?? null;
  }

  private saveUser(user: AuthResponse, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
      sessionStorage.removeItem(this.storageKey);
    } else {
      sessionStorage.setItem(this.storageKey, JSON.stringify(user));
      localStorage.removeItem(this.storageKey);
    }
    this.currentUser.set(user);
  }

  private readStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem(this.storageKey) ?? sessionStorage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthResponse;
    } catch {
      return null;
    }
  }
}
