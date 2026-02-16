import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmiCardComponent } from '../../../shared/components';

export interface Exercise {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  cals: number;
  image?: string; // Opsional: jika nanti ada gambar
}

export interface WorkoutDetails {
  // totalDuration: string;  // '45 Mins'
  intensity?: string;     // 'Intermediate' (Opsional)
  totalCalories: number;  // 350
  equipment: string[];    // ['Dumbbell', 'Mat']
  exercises: Exercise[];  // Array dari interface Exercise di atas
}

export interface WorkoutSchedule {
  day: number;
  focus: string;    // 'Leg Day', 'Chest Day'
  
  env: {
    home: WorkoutDetails;
    gym: WorkoutDetails;
  };
}

export interface UserWellnessProfile {
  id: string;
  name: string;
  height: number;       // dalam cm
  weight: number;       // dalam kg
  bmi: number;          // hasil kalkulasi
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

export interface UserTarget{
  bodyFatTarget: number;
  weightTarget: number;
}

export interface UserRoutine{
    level: string;
    freq:number;
    avg_dur:number;
}

// 1. Khusus Meal (Satu Makanan)
interface Meal {
  name: string;
  porsi: string;
  calories: number;
  protein: string;
  image: string;
}

@Component({
  selector: 'app-recommendation',
  imports: [CommonModule, BmiCardComponent],
  templateUrl: './recommendation.html',
  styleUrl: './recommendation.css',
})

export class RecommendationPage {
  // === 1. DATA USER & PROGRAM (Top Section) ===
  // userProfile = {
  //   name: 'Alex',
  //   programType: 'Weight Loss',
  //   targetWeight: 65,
  //   currentWeight: 70,
  //   height: 175,
  //   bmi: 22.9,
  //   bmiStatus: 'Normal',
  //   bodyFat: 18,
  //   gender: 'Female'
  // };

// === 2. DATA WORKOUT SCHEDULE (Middle Section) ===
activeTab: 'home' | 'gym' = 'home'; // Default 'home'
selectedDayIndex: number = 0; // Default Day 1 (index 0)

// Data Dummy (Contoh struktur data kamu)
WorkoutSchedule = [
  { 
    day: 1, 
    focus: 'Leg Day', // Judul fokus tetap sama
    env: {
      home: {
        // totalDuration: '45 Min',
        totalCalories: 320,
        equipment: ['Yoga Mat'],
        exercises: [
          { name: 'Squat Jump', muscle: 'Legs', sets: 3, reps: '12- 15', cals: 20 },
          { name: 'Lunges', muscle: 'Glutes', sets: 3, reps: '12', cals: 15 },
          { name: 'Calf Raises', muscle: 'Calves', sets: 3, reps: '20', cals: 10 }
        ]
      },
      gym: {
        // totalDuration: '60 Min',
        totalCalories: 450,
        equipment: ['Barbell', 'Leg Press Machine'],
        exercises: [
          { name: 'Barbell Squat', muscle: 'Legs', sets: 4, reps: '8-10', cals: 40 }, // Latihan lebih berat
          { name: 'Leg Press', muscle: 'Legs', sets: 3, reps: '12', cals: 30 },
          { name: 'Leg Extension', muscle: 'Quads', sets: 3, reps: '15', cals: 25 }
        ]
      }
    }
  },
  { 
    day: 2, 
    focus: 'Chest Day', 
    env: {
      home: {
        totalDuration: '30 Min',
        totalCalories: 280,
        equipment: ['None'],
        exercises: [
          { name: 'Diamond Push Up', muscle: 'Inner Chest', sets: 4, reps: '10', cals: 25 },
          { name: 'Wide Push Up', muscle: 'Outer Chest', sets: 3, reps: '12', cals: 22 },
        ]
      },
      gym: {
        totalDuration: '55 Min',
        totalCalories: 380,
        equipment: ['Bench', 'Dumbbell'],
        exercises: [
          { name: 'Bench Press', muscle: 'Chest', sets: 4, reps: '8', cals: 45 },
          { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', sets: 3, reps: '10', cals: 35 },
        ]
      }
    }
  },
  // ... hari lainnya
];


//USER DATA
userProfile: UserWellnessProfile = {
    id: 'user_12345',
    name: 'Viktoria',
    height: 165,
    weight: 60,
    bmi: 21.3, // Sebaiknya dihitung di backend atau service
    bodyFat: {
      percentage:'18-20%',
      category: 'Fitness',
      image:'/global/body-fat/male_average.svg',
    },
    gender: 'Male',
    program: {
      title: 'Weight Loss',
      description: 'Workout jenis ini merupakan workout yang berfokus pada bagian jantung. Secara umum, cardio fitness digunakan untuk menurunkan berat badan.',
      image: 'pages/recommendation/cardio.png'
    },
    level: 'Beginner',
    freq: 4,
};

//TARGET USER
userTarget: UserTarget = {
  weightTarget: 50,
  bodyFatTarget : 18,
}

//USER ROUTINEE
userRoutine: UserRoutine = {
      level: 'Beginner',
      freq: 4,
      avg_dur: 16,
}

//MEALS
  selectedFrequency: number = 3; // Default 3x makan
  displayedMeals: Meal[] = [];   // Data yang tampil di HTML
  currentTotalCalories: number = 0; // Total kalori dari rekomendasi saat ini
  // targetCalories: number = 2200; // Target harian user (bisa dari database user)

  // 2. DATA MOCK (Pura-pura jadi Output Machine Learning)
  mlDatabaseMock: Record<number, Meal[]> = {
    1: [
      { name: 'Super Steak & Potatoes', calories: 1800, protein: '120g' , image: 'pages/steak.png', porsi:'1.0 Porsi Besar'}
    ],
    2: [
      { name: 'Avocado Toast & Eggs', calories: 800, protein: '40g', image: 'pages/toast.png', porsi:'1.0 Piring' },
      { name: 'Salmon & Quinoa', calories: 1000, protein: '60g', image: 'pages/salmon.png', porsi:'1.0 Mangkok' }
    ],
    3: [
      { name: 'Oatmeal & Berries', calories: 500, protein: '20g', image: 'pages/oatmeal.png', porsi:'1.0 Mangkok' },
      { name: 'Grilled Chicken Breast', calories: 700, protein: '50g', image: 'pages/chicken.png', porsi:'1.0 Piring' },
      { name: 'Tuna Salad', calories: 600, protein: '40g', image: 'pages/tuna.png', porsi:'1.0 Mangkok' }
    ],
    4: [
      { name: 'Breakfast Omelette', calories: 400, protein: '20g', image: 'pages/omelette.png', porsi:'1.0 Piring' },
      { name: 'Lunch Beef Bowl', calories: 500, protein: '30g', image: 'pages/beef.png', porsi:'1.0 Mangkok' },
      { name: 'Afternoon Snack Bar', calories: 300, protein: '15g', image: 'pages/snack.png', porsi:'1.0 Bungkus' },
      { name: 'Dinner Fish Fillet', calories: 600, protein: '35g', image: 'pages/fish.png', porsi:'1.0 Piring' }
    ],
    5: [
      { name: 'Small Breakfast', calories: 300, protein: '15g', image: 'pages/img1.png', porsi:'0.5 Piring' },
      { name: 'Mid-Morning Snack', calories: 400, protein: '25g', image: 'pages/img2.png', porsi:'1.0 Buah' },
      { name: 'Lunch Portion', calories: 400, protein: '25g', image: 'pages/img3.png', porsi:'0.5 Piring' },
      { name: 'Pre-Workout', calories: 300, protein: '15g', image: 'pages/img4.png', porsi:'1.0 Shake' },
      { name: 'Dinner Light', calories: 400, protein: '20g', image: 'pages/img5.png', porsi:'0.5 Piring' }
    ]
  };

  // Fungsi saat Dropdown berubah
  onDayChange(event: any) {
    const freq = parseInt(event.target.value);
    this.selectedFrequency = freq;
    this.updateRecommendation(freq);
  }

  // Logic Update Data & Hitung Kalori
  updateRecommendation(freq: number) {
    // 1. Ambil data dari Mock
    this.displayedMeals = this.mlDatabaseMock[freq] || [];

    // 2. Hitung Total Kalori (pake reduce biar keren & cepat)
    this.currentTotalCalories = this.displayedMeals.reduce((sum, item) => sum + item.calories, 0);
  }

  constructor() {}

  ngOnInit(): void {
    this.updateRecommendation(this.selectedFrequency);
  }

  // Logic ganti hari
  selectDay(index: number) {
    this.selectedDayIndex = index;
  }
}
