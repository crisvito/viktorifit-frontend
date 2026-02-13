import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bmi-card',
  standalone: true, // <--- WAJIB ADA (Solusi NG2012)
  imports: [CommonModule],
  templateUrl: './bmi-card.component.html', // Pastikan nama file HTML-nya sesuai ini
})
export class BmiCardComponent implements OnChanges {
  
  @Input() height: number = 0;
  @Input() weight: number = 0;
  @Input() bmi: number = 0;

  markerPosition: number = 0;
  
  bmiDesc: string = 'Good starting BMI to tone up and get your dream body.';
  bmiStatus: string = 'Normal';
  bmiColor: string = 'text-[#6A9700]'; 
  bmiBgClass: string = 'bg-[#E7F4C8] border-[#8AC500]';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bmi'] || changes['height'] || changes['weight']) {
      this.calculateMarkerPosition();
      this.determineStatus();
    }
  }

  calculateMarkerPosition() {
    const minBMI = 15;
    const maxBMI = 40;
    let percentage = ((this.bmi - minBMI) / (maxBMI - minBMI)) * 100;
    this.markerPosition = Math.max(0, Math.min(100, percentage));
  }

  determineStatus() {
      if (this.bmi < 18.5) {
      this.bmiStatus = 'Underweight';
      this.bmiColor = 'text-sky-600'; 
      this.bmiBgClass = 'bg-sky-100 border-sky-300';
      this.bmiDesc = 'You\'re Underweight. Focus on nutrient-dense foods.';
      
    } else if (this.bmi < 25) {
      this.bmiStatus = 'Healthy';
      this.bmiColor = 'text-[#4E7000]';
      this.bmiBgClass = 'bg-[#E7F4C8] border-[#8AC500]';
      this.bmiDesc = 'Good starting BMI to tone up and get your dream body.';

    } else if (this.bmi < 30) {
      this.bmiStatus = 'Overweight';
      this.bmiColor = 'text-yellow-700'; 
      this.bmiBgClass = 'bg-yellow-100 border-yellow-400';
      this.bmiDesc = 'You\'re Overweight. A balanced diet and cardio can help.';

    } else {
      this.bmiStatus = 'Obese';
      this.bmiColor = 'text-red-600'; 
      this.bmiBgClass = 'bg-red-100 border-red-300';
      this.bmiDesc = 'High health risk. Please consult a doctor for a plan.';
    }    
  }                                                                      
}