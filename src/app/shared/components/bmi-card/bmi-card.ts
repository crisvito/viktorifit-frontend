import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bmi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bmi-card.html',
})

export class BmiCardComponent implements OnChanges {
  
  // Menerima data dari Parent
  @Input() height: number = 0;
  @Input() weight: number = 0;
  @Input() bmi: number = 0;

  markerPosition: number = 0;
  // bmiImage
  bmiDesc : string = 'Good starting BMI to tone up and get your dream body.';
  bmiStatus: string = 'Normal';
  bmiColor: string = 'text-[#6A9700]'; // Default Text
  bmiBgClass: string = 'bg-[#E7F4C8] border-[#8AC500]'; // Default BG (Hijau Muda)

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bmi']) {
      this.calculateMarkerPosition();
      this.determineStatus();
    }
  }

  // Menghitung posisi marker (persen dari kiri)
  // Asumsi grafik dimulai dari BMI 15 sampai 40
  calculateMarkerPosition() {
    const minBMI = 15;
    const maxBMI = 40;
    
    // Rumus persentase posisi
    let percentage = ((this.bmi - minBMI) / (maxBMI - minBMI)) * 100;
    
    // Batasi supaya marker gak keluar jalur (0% - 100%)
    this.markerPosition = Math.max(0, Math.min(100, percentage));
  }

  determineStatus() {
      if (this.bmi < 18.5) {
      // UNDERWEIGHT (Biru)
      this.bmiStatus = 'Underweight';
      this.bmiColor = 'text-sky-600'; 
      this.bmiBgClass = 'bg-sky-100 border-sky-300'; // BG Biru Muda
      this.bmiDesc = 'You\'re Underweight';
      
    } else if (this.bmi < 25) {
      // HEALTHY (Hijau - Warna desain kamu)
      this.bmiStatus = 'Healthy';
      this.bmiColor = 'text-[#4E7000]'; // Hijau Tua
      this.bmiBgClass = 'bg-[#E7F4C8] border-[#8AC500]'; // Hijau Muda
      this.bmiDesc = 'Good starting BMI to tone up and get your dream body.';

    } else if (this.bmi < 30) {
      // OVERWEIGHT (Kuning/Oranye)
      this.bmiStatus = 'Overweight';
      this.bmiColor = 'text-yellow-700'; 
      this.bmiBgClass = 'bg-yellow-100 border-yellow-400'; // Kuning Muda
      this.bmiDesc = 'You\'re Overweight';

    } else {
      // OBESE (Merah)
      this.bmiStatus = 'Obese';
      this.bmiColor = 'text-red-600'; 
      this.bmiBgClass = 'bg-red-100 border-red-300'; // Merah Muda
      this.bmiDesc = 'High health risk. Please consult a doctor.';
    }    
  }                                                                     
}