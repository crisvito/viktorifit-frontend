import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  // Kita buat variabel input agar bisa diisi dari luar
  @Input() AriaLabel: string = 'Click Me';
  @Input() extraClass: string = '';
}