import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router } from '@angular/router';
import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements CanActivate, CanActivateChild {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.authService.getUser();
    
    if (user) {
      const profile = user.userProfileDTO;
      const isProfileEmpty = !profile || (profile.age === null && profile.dob === null);

      if (isProfileEmpty) {
        this.router.navigate(['/onboarding']);
        return false;
      }
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  canActivateChild(): boolean {
    return this.canActivate();
  }
}