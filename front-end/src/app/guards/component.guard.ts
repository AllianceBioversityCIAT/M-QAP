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
export class ComponentGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const roles = route?.data?.['roles'] as string[];
    const responsibilities = route?.data?.['responsibilities'] as string[];

    const user = await this.authService.getLoggedInUser();
    if (!user) {
      this.authService.goToLogin();
      return false;
    } else {
      if (roles) {
        if (roles.indexOf(user.role) !== -1) {
          return true;
        }
      }

      if (responsibilities) {
        return await this.authService.checkResponsibilities(responsibilities);
      }

      this.router.navigate(['/home']);
      return false;
    }
  }
}
