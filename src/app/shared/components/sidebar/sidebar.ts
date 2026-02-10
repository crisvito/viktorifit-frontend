import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  menu = [
    { 
      label: 'Dashboard', 
      icon: 'dashboard', 
      route: 'dashboard', 
      activeKey: 'dashboard' 
    },
    { 
      label: 'Statistics', 
      icon: 'statistics', 
      route: 'statistics', 
      activeKey: 'statistics' 
    },
    { 
      label: 'Workouts List', 
      icon: 'workout-lists', 
      route: 'workout-lists',
      activeKey: 'workout' 
    },
    { 
      label: 'Calendar', 
      icon: 'calendar', 
      route: 'schedule', 
      activeKey: 'schedule' 
    },
    { 
      label: 'Recommendation', 
      icon: 'recommendation', 
      route: 'recommendation', 
      activeKey: 'recommendation' 
    }
  ];

  isSidebarOpen = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  isMenuActive(m: any): boolean {
    const currentUrl = this.router.url;
    if (m.route === 'dashboard') {
      return currentUrl === '/dashboard' || currentUrl === '/';
    }

    if (m.activeKey === 'schedule') {
        return currentUrl.includes('schedule') || currentUrl.includes('history');
    }

    return currentUrl.includes(m.activeKey);
  }
}