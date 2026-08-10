export type AuthRole = 'Customer' | 'Admin' | 'SuperAdmin';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
  role: AuthRole;
}

export interface AuthResponse {
  token: string;
  role: AuthRole;
  userName: string;
  email: string;
  phone?: string;
  savedProperties?: any[];
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}
