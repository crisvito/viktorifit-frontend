import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
=======
import { AuthService } from '../../../core';
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7

@Component({
  selector: 'app-navbar',
  standalone : true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
<<<<<<< HEAD
export class NavbarComponent {
  isMenuOpen = false;
  isScrolled = false;

=======

export class NavbarComponent {
  isMenuOpen = false;
  isScrolled = false;

  constructor(public authService: AuthService) {}
  
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Jika scroll lebih dari 20px, ubah status jadi true
    this.isScrolled = window.scrollY > 20;
  }
<<<<<<< HEAD
}
=======

  logout() {
    this.authService.logout();
  }
}
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
