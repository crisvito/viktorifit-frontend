import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  Router
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return this.check();
  }

  canActivateChild(): boolean {
    return this.check();
  }

  private check(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.authService.logout(); 
      this.router.navigate(['./login']);
      return false;
    }

    const user = this.authService.getUser();
    
    if (user?.role === 'ADMIN' || this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return false;
    }

    return true;
  }
}