import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthRole } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const expectedRole = route.data['role'] as AuthRole;
  const currentRole = authService.currentRole();

  if (!authService.isAuthenticated()) {
    return router.createUrlTree([expectedRole === 'Admin' ? '/admin/login' : '/login']);
  }

  if (currentRole !== expectedRole) {
    return router.createUrlTree([currentRole === 'Admin' ? '/admin/dashboard' : '/']);
  }

  return true;
};
