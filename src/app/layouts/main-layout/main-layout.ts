import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/components';


@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
