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
    return router.createUrlTree(['/login']);
  }

  if (currentRole !== expectedRole && !(expectedRole === 'Admin' && currentRole === 'SuperAdmin')) {
    return router.createUrlTree([
      currentRole === 'Admin' || currentRole === 'SuperAdmin' ? '/admin/dashboard' : '/',
    ]);
  }

  return true;
};
