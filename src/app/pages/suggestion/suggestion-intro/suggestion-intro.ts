import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Tambahkan 'Router' di import
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'suggestion-intro',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    ButtonComponent
  ],
  templateUrl: './suggestion-intro.html',
  styleUrl: './suggestion-intro.css', // Perhatikan: biasanya styleUrl (Angular 17+) atau styleUrls (array)
})
export class SuggestionIntroPage {

  // 2. Inject Router ke dalam constructor agar bisa dipanggil
  constructor(private router: Router) {}

  // 3. Buat fungsi untuk pindah halaman saat tombol diklik
  startOnboarding() {
    // Pastikan path '/onboarding' sesuai dengan yang ada di app.routes.ts kamu
    this.router.navigate(['/onboarding']); 
  }

}