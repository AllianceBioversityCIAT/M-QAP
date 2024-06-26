import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../pages/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = await this.authService.getLoggedInUser();
    if (!user) {
      this.authService.goToLogin();
      return false;
    } else {
      if (user.role == 'admin') {
        return true;
      } else {
        this.router.navigate(['/home']);
        return false;
      }
    }
  }
}
