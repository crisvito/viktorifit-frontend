import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../shared/components/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, FormsModule, RouterModule, RouterOutlet, AdminSidebar], 
  standalone: true,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
}