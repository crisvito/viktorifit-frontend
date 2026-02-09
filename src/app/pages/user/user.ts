import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../shared/components/sidebar/sidebar';
import { HeaderActions } from '../../shared/components/header-actions/header-actions';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar, HeaderActions],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class User {

}
