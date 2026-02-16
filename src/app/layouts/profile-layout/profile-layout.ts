import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileSidebar } from '../../shared/components';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProfileSidebar],
  templateUrl: './profile-layout.html',
  styleUrl: './profile-layout.css',
})
export class ProfileLayout {

  constructor(
    private router: Router,
    private location: Location
  ) {}

  goBack() {
      this.router.navigate(['/dashboard']); 
  }

  handleLogout() {
    this.router.navigate(['/login']);
  }
}