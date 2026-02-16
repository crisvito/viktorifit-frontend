import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {

  constructor(public authService: AuthService) {}

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.getRole() === 'ADMIN';
  }

  isUser(): boolean {
    return this.authService.getRole() === 'USER';
  }

  isGuest(): boolean {
    return !this.isAuthenticated();
  }

}
