import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[] | undefined;
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const userRoles = user.roles || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (hasRole) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}
