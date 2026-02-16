import { Injectable } from '@angular/core';
import { CanActivate, Router, CanActivateChild } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    return this.checkAdminAccess();
  }

  canActivateChild(): boolean {
    return this.checkAdminAccess();
  }

  private checkAdminAccess(): boolean {
    if (this.authService.isAdmin()) {
      return true;
    }

    this.router.navigate(['/dashboard']);
    return false;
  }
}

