import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/button/button';
import { BmiGaugeComponent } from '../../shared/components/bmi-gauge/bmi-gauge';

// import { PredictionService } from '../../services/prediction.service'; //dari file ml yang udah di export, nama file nya disesuain aja

@Component({
  selector: 'app-suggestion',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    ButtonComponent,
    BmiGaugeComponent
  ],
  templateUrl: './suggestion.html',
  styleUrl: './suggestion.css',
})

export class SuggestionPage implements OnInit {

  // Default data (Placeholder)
  resultData = {
    condition: 'Overweight', 
    bmiScore: 26.5,
    goal : 'Weight Loss',
    workouttype : 'Cardio Fitness',
    workoutPlan: ['Jalan', 'Renang', 'Yoga', 'Lari'],
    description : 'Anda memiliki berat badan di atas normal. Disarankan untuk melakukan olahraga kardio secara rutin dan mengatur pola makan sehat.',
    dietPlan: {
      calories: 1800,
      description: 'Kurangi karbohidrat olahan, perbanyak serat sayuran.'
    }
  };

  inputUser: any = null;
  // resultData: any = null; //replace data kalau misalnya ml-nya udah diconnect

  //warna
  colorMap: any = {    
    'Overweight': 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-orange-200 text-white',
    'Obese': 'bg-gradient-to-br from-red-500 to-red-700 shadow-red-200 text-white',
    'Normal': 'bg-gradient-to-br from-green-400 to-green-600 shadow-green-200 text-white',
    'Underweight': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200 text-white'
  };

  //inject service dan route
  constructor(
    // private predictionService: PredictionService, //from ml
    private route: ActivatedRoute //get data from page sblmnya
  ) {}

  ngOnInit() {
    console.log('Halaman suggestion dimuat');

    this.route.queryParams.subscribe(params => {
      
      // Ambil data dari URL (misal: ?weight=90&height=170)
      this.inputUser = {
        weight: Number(params['weight']) || 90, 
        height: Number(params['height']) || 170,
        age: Number(params['age']) || 25,
        symptomps : params['syptomps']||'None',
        gender: params['gender'] || 'Male'
      };

      // this.getPredictionFromBackend(inputUser); // call function for get data from ml
    });
  }

  // getPredictionFromBackend(data: any) {
  //   this.predictionService.getPrediction(data).subscribe({
  //     next: (hasilDariPython) => {
  //       console.log('Sukses dapat balasan:', hasilDariPython);
  //       this.resultData = hasilDariPython; // Update HTML
  //     },
  //     error: (err) => {
  //       console.error('Gagal connect ke Python:', err);
  //       // Opsional: Kasih alert ke user
  //       alert('Gagal mengambil data prediksi. Pastikan server Python nyala!');
  //     }
  //   });
  // }

  getThemeClass() {
    if (!this.resultData) return 'bg-gray-500'; 
    
    const status = this.resultData.condition;
    return this.colorMap[status] || 'bg-gray-500 text-white';
  }
}
