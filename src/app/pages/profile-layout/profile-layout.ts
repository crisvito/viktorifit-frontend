import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileSidebar } from '../../shared/components/profile-sidebar/profile-sidebar';
import { Navigation } from '../../shared/services/navigation/navigation';

@Component({
  selector: 'app-profile-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ProfileSidebar],
  templateUrl: './profile-layout.html',
})
export class ProfileLayout {

  constructor(
    private router: Router,
    private navService: Navigation
  ) {}

  goBack() {
    const targetUrl = this.navService.getBackTarget();
    
    this.router.navigateByUrl(targetUrl);
  }

  handleLogout() {
    this.router.navigate(['/login']);
  }
}