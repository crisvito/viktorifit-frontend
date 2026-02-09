import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-sidebar.html',
  styleUrl: './profile-sidebar.css',
})

export class ProfileSidebar {
  @Output() logoutEvent = new EventEmitter<void>();

  menuItems = [
    { label: 'My Account', route: 'my-account', icon: 'person' },
    { label: 'Personal Data', route: 'personal-data', icon: 'document' },
    { label: 'Settings', route: 'settings', icon: 'settings' }
  ];

  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  onLogout() {
    this.logoutEvent.emit();
    this.closeSidebar();
  }
}
