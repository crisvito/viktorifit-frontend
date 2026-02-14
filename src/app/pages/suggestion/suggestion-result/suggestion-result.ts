import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BmiCardComponent, ButtonComponent } from '../../../shared/components';

// import { PredictionService } from '../../services/prediction.service'; //dari file ml yang udah di export, nama file nya disesuain aja
interface Workout {
  id: number;
  category: string;
  name: string;
  description: string;
  sets: number;
  reps: string;
  type: 'home' | 'gym';
}

interface UserWellnessProfile {
  id: string;
  name: string;
  height: number;       
  weight: number;       
  bmi: number;          
  bodyFat: {
    percentage : string,
    category : string;
    image: string;
  };      // dalam persen
  gender: 'Male' | 'Female';
  program: {
    title: string;      // misal: Weight Loss
    description: string;
    image: string;      // path gambar
  };
  level: string;
  freq:number;
}

// 1. Khusus Meal (Satu Makanan)
interface MealItem {
  name: string;
  porsi: string;
  calories: number;
  protein: string;
  image: string;
}

// 2. Khusus Data Nutrisi (Total + List)
interface NutritionData {
  targetCalories: number; // Angka total yg sudah mateng (2750)
  meals: MealItem[];      // Array makanannya
}

@Component({
  selector: 'suggestion-result',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    ButtonComponent,
    BmiCardComponent
  ],
  templateUrl: './suggestion-result.html',
  styleUrl: './suggestion-result.css',
})

export class SuggestionResultPage implements OnInit {
  
  userData: UserWellnessProfile = {
    id: '',
    name: '',
    height: 0,
    weight: 0,
    bmi: 0,
    bodyFat: {
      percentage:'',
      category:'',
      image:'',
    },
    gender: 'Female',
    program: {
      title: 'Loading...',
      description: '',
      image: '' 
    },
    level:'',
    freq:0,
  };
  isLoading: boolean = true;
  nutritionData: NutritionData | null = null;

  constructor() { }

  ngOnInit(): void {
    this.fetchUserData();
  }

  // Simulasi memanggil API Database
  fetchUserData() {
    this.isLoading = true;

    // Anggap ini request ke Backend (Service)
    setTimeout(() => {
      // DUMMY DATA (Ini yang nanti diganti response API)
      this.userData = {
        id: 'user_12345',
        name: 'Viktoria',
        height: 165,
        weight: 60,
        bmi: 21.3, // Sebaiknya dihitung di backend atau service
        bodyFat: {
          percentage:'18-20%',
          category: 'Fitness',
          image:'pages/recommendation/Athletic.png',
        },
        gender: 'Female',
        program: {
          title: 'Weight Loss',
          description: 'Workout jenis ini merupakan workout yang berfokus pada bagian jantung. Secara umum, cardio fitness digunakan untuk menurunkan berat badan.',
          image: 'pages/recommendation/cardio.png'
        },
        level: 'Beginner',
        freq: 4,
      };

      this.nutritionData = {
        targetCalories: 2750, // <--- Angka mateng dari backend
        meals: [
          { name: 'Gun powder chutney', porsi: '2.0 porsi', calories: 625, protein: '43.1g', image: 'assets/food1.jpg' },
          { name: 'Maa chaane ki dal', porsi: '1.5 porsi', calories: 517, protein: '29.7g', image: 'assets/food2.jpg' },
          { name: 'Lobster Roll Sandwich', porsi: '1.0 porsi', calories: 450, protein: '20.0g', image: 'assets/food3.jpg' },
          { name: 'Bengal 5 Spice Blend', porsi: '2.0 porsi', calories: 580, protein: '36.5g', image: 'assets/food4.jpg' },
          { name: 'Cracked Wheat Premix', porsi: '1.5 porsi', calories: 543, protein: '23.8g', image: 'assets/food5.jpg' }
        ]
      };

      this.isLoading = false;
    }, 1);
  }

  // Menghitung posisi marker (0% - 100%) berdasarkan skala chart (15 - 40)
  // get markerPosition(): number {
  //   const min = 15;
  //   const max = 40;
  //   const range = max - min;
    
  //   // Rumus: (Nilai - Min) / Range * 100
  //   let percent = (( - min) / range) * 100;
    
  //   // Batasi supaya tidak keluar chart (clamp)
  //   return Math.max(0, Math.min(100, percent));
  // }

  workoutMode: 'home' | 'gym' = 'home';

  allWorkouts: Workout[] = [
    {
      id: 1,
      category: 'Chest & Triceps',
      name: 'Standard Push-Ups',
      description: 'Fokus pada kontraksi otot dada bagian tengah dan penguatan stabilitas sendi bahu.',
      sets: 4,
      reps: '12',
      type: 'home'
    },
    {
      id: 2,
      category: 'Legs',
      name: 'Bodyweight Squats',
      description: 'Latihan fundamental untuk memperkuat otot quadriceps dan glutes tanpa alat.',
      sets: 3,
      reps: '15',
      type: 'home'
    },
    {
      id: 3,
      category: 'Chest',
      name: 'Barbell Bench Press',
      description: 'Latihan compound utama untuk membangun massa otot dada secara keseluruhan.',
      sets: 4,
      reps: '8-10',
      type: 'gym'
    },
    {
      id: 4,
      category: 'Back',
      name: 'Lat Pulldown',
      description: 'Menargetkan otot latissimus dorsi untuk menciptakan bentuk punggung V-taper.',
      sets: 3,
      reps: '12',
      type: 'gym'
    }
  ];

  // Getter untuk filter data berdasarkan mode yang dipilih
  get filteredWorkouts() {
    return this.allWorkouts.filter(w => w.type === this.workoutMode);
  }

  setMode(mode: 'home' | 'gym') {
    console.log('Mode berubah ke:', mode); // Cek di console browser (F12)
    this.workoutMode = mode;
  }
}