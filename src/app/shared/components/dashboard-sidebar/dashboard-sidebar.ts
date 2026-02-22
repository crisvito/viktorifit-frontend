import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.css',
})
export class DashboardSidebar {
  menu = [
    { 
      label: 'Dashboard', 
      icon: 'dashboard', 
      route: '', 
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
      label: 'Schedule', 
      icon: 'calendar', 
      route: 'schedule', 
      activeKey: 'schedule' 
    },
    { 
      label: 'Recommendation', 
      icon: 'recommendation', 
      route: 'recommendation', 
      activeKey: 'recommendation' 
    },
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
    
    if (currentUrl.includes('/history') && m.activeKey === 'schedule') {
      return true;
    }

    if (m.route === '') {
      return currentUrl === '/dashboard' || currentUrl === '/';
    }

    return currentUrl.includes(m.activeKey);
  }
}