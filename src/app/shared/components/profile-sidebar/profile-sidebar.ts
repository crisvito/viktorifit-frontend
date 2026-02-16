import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-sidebar.html',
  styleUrl: './profile-sidebar.css',
})

export class ProfileSidebar {
  @Output() logoutEvent = new EventEmitter<void>();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  menuItems = [
    { label: 'My Account', route: 'my-account', icon: 'person' },
    { label: 'Personal Data', route: 'personal-data', icon: 'document' },
    { label: 'Settings', route: 'settings', icon: 'settings' }
  ];

  isSidebarOpen = false;
  showLogoutModal = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  openLogoutModal() {
    this.showLogoutModal = true;
  }

  closeLogoutModal() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.authService.logout(); 
    this.closeSidebar();
    this.router.navigate(['/login']);
  }
}