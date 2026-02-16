import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.css'
})
export class AdminSidebar {

  menu = [
    { 
      label: 'FAQ', 
      icon: 'faq',
      route: 'admin/faq',
      activeKey: 'faq' 
    },
    { 
      label: 'Feedback', 
      icon: 'feedback',
      route: 'admin/feedback', 
      activeKey: 'feedback' 
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
    
    return currentUrl.includes(m.activeKey);
  }
}