import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmiCardComponent } from '../../../shared/components';
import { FormsModule } from '@angular/forms';

// --- INTERFACE DEFINITIONS ---
export interface Exercise {
  name: string;
  muscle: string;
  sets: number;
  reps: string;
  cals: number;
  image?: string; 
}

export interface WorkoutDetails {
  totalDuration?: string; 
  totalCalories: number; 
  equipment: string[];   
  exercises: Exercise[];
}

export interface WorkoutSchedule {
  day: number;
  title: string; 
  env: {
    home: WorkoutDetails;
    gym: WorkoutDetails;
  };
}

// Interface untuk Meal sesuai tampilan UI
export interface Meal {
  name: string;
  porsi: string; 
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  image: string;
  items: string[]; 
}

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [CommonModule, BmiCardComponent, FormsModule],
  templateUrl: './recommendation.html',
  styleUrl: './recommendation.css', // Pastikan file css ada atau hapus baris ini
})
export class RecommendationPage implements OnInit {

  // === 1. STATE VARIABLES ===
  activeTab: 'home' | 'gym' = 'home';
  selectedDayIndex: number = 0;
  
  workoutSchedule: WorkoutSchedule[] = [];
  
  userProfile: any = {}; 
  userTarget: any = {};
  userRoutine: any = {};

  // === 2. MEAL STATE ===
  selectedFrequency: number = 3; 
  displayedMeals: Meal[] = [];   
  currentTotalCalories: number = 0;
  
  // Data Meal Lengkap dari ML
  mealDatabase: Record<number, Meal[]> = {};

  constructor() {}

  ngOnInit(): void {
    this.loadMLData();
  }


  getBodyFatInfo(catId: number, gender: string) {
    // Tentukan prefix gambar berdasarkan gender (cowok/cewek beda gambar biasanya)
    // Kalau di aset kamu cuma ada satu jenis, hapus bagian prefix ini.
    // Asumsi: gender 'male' -> 'm-', 'female' -> 'f-' (sesuaikan dengan nama file kamu)
    const prefix = gender.toLowerCase() === 'female' ? 'female' : 'male'; 
    
    switch(catId) {
      case 1: 
        return { label: 'Essential', image: `/global/body-fat/${prefix}_veryLean.svg` };
      case 2: 
        return { label: 'Athlete', image: `/global/body-fat/${prefix}_athletic.svg` };
      case 3: 
        return { label: 'Fitness', image: `/global/body-fat/${prefix}_average.svg` };
      case 4: 
        return { label: 'Average', image: `/global/body-fat/${prefix}_overweight.svg` };
      case 5: 
        return { label: 'Obese', image: `/global/body-fat/${prefix}_obese.svg` };
      default: 
        return { label: 'Average', image: `/global/body-fat/${prefix}_average.svg` };
    }
  }

  // === 3. LOAD & MAP DATA ===
  loadMLData() {
    const data = localStorage.getItem('ml_result');
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      const profile = parsed.userProfile || {};
      const workoutHome = parsed.workoutRecommendation?.home?.workout_plan || {};
      const workoutGym = parsed.workoutRecommendation?.gym?.workout_plan || {};
      
      // Ambil bagian mealRecommendation
      const mealRecs = parsed.mealRecommendation || {};

      const bodyFatInfo = this.getBodyFatInfo(profile.bodyFatCategory, profile.gender);

      // A. MAP USER PROFILE
      this.userProfile = {
        name: 'User', 
        height: profile.height,
        weight: profile.weight,
        bmi: this.calculateBMI(profile.weight, profile.height),
        bodyFat: {
          percentage: `${profile.bodyFatPercentage}%`,
          category: this.getBodyFatCategory(profile.bodyFatCategory),
          image: bodyFatInfo.image, 
        },
        gender: profile.gender,
        program: {
          title: profile.goal,
          description: this.getGoalDescription(profile.goal),
          image: 'pages/recommendation/cardio.png'
        },
        level: profile.level,
        freq: profile.frequency
      };

      // B. MAP USER TARGET (Progress Week 12)
      const roadmap = parsed.progressRecommendation?.roadmap || [];
      const finalWeek = roadmap.length > 0 ? roadmap[roadmap.length - 1] : null;
      
      this.userTarget = {
        weightTarget: finalWeek?.physical?.weight_kg || profile.weight, 
        bodyFatTarget: 18 // Default
      };

      this.userRoutine = {
        level: profile.level,
        freq: profile.frequency,
        avg_dur: profile.duration
      };

      // C. MAP WORKOUT SCHEDULE
      const homeKeys = Object.keys(workoutHome);
      const gymKeys = Object.keys(workoutGym);

      this.workoutSchedule = homeKeys.map((dayKey, index) => {
        const gymKey = gymKeys[index] || dayKey; 

        return {
          day: index + 1,
          title: dayKey, 
          env: {
            home: this.mapWorkoutDetails(workoutHome[dayKey]),
            gym: this.mapWorkoutDetails(workoutGym[gymKey])
          }
        };
      });

      // D. MAP MEAL RECOMMENDATION (PERBAIKAN DISINI)
      // Perhatikan key akses: mealRecs.freqX.meal_plan
      this.mealDatabase[2] = this.mapMeals(mealRecs.freq2?.meal_plan);
      this.mealDatabase[3] = this.mapMeals(mealRecs.freq3?.meal_plan);
      this.mealDatabase[4] = this.mapMeals(mealRecs.freq4?.meal_plan);
      this.mealDatabase[5] = this.mapMeals(mealRecs.freq5?.meal_plan);

      // Set Default Meal View
      this.selectedFrequency = 3; // Default
      this.updateRecommendation(this.selectedFrequency);

    } catch (e) {
      console.error("Error parsing ML Data", e);
    }
  }

  // --- HELPER MAPPING WORKOUT ---
  mapWorkoutDetails(exercises: any[]): WorkoutDetails {
    if (!exercises) return { totalCalories: 0, equipment: [], exercises: [] };

    const totalCals = exercises.reduce((acc, curr) => acc + (Number(curr.calories_burned) || 0), 0);
    
    const allEquip = exercises.map(e => e.equipment).join(',').split(',');
    const uniqueEquip = [...new Set(allEquip.map(s => s.trim()))].filter(s => s && s !== 'None');

    // Total Duration = duration + rest
    const totalDur = exercises.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0) + (Number(curr.rest_minutes) || 0), 0);

    return {
      totalDuration: `${totalDur} Min`,
      totalCalories: totalCals,
      equipment: uniqueEquip.slice(0, 3), 
      exercises: exercises.map(ex => ({
        name: ex.exercise_name,
        muscle: ex.muscle_group,
        sets: ex.sets,
        reps: String(ex.reps),
        cals: ex.calories_burned,
        image: '' 
      }))
    };
  }

  // --- HELPER MAPPING MEAL (PERBAIKAN DISINI) ---
  mapMeals(mealsData: any[]): Meal[] {
    if (!mealsData || !Array.isArray(mealsData)) return [];
    
    const dummyImages = ['pages/steak.png', 'pages/salmon.png', 'pages/chicken.png', 'pages/oatmeal.png', 'pages/fish.png'];
    
    return mealsData.map((m, i) => ({
      name: m.menu_name, // Backend: menu_name -> UI: name
      porsi: `${m.portion} Portion`, // Backend: portion (number) -> UI: porsi (string)
      calories: Math.round(Number(m.calories)), // Bulatkan kalori
      protein: `${Math.round(Number(m.protein))}g`,
      carbs: `${Math.round(Number(m.carbs))}g`,
      fat: `${Math.round(Number(m.fat))}g`,
      items: [], // Backend tidak kirim ingredients, set kosong
      image: dummyImages[i % dummyImages.length] 
    }));
  }

  // --- UI ACTIONS ---
  onDayChange(event: any) {
    const freq = parseInt(event.target.value);
    this.selectedFrequency = freq;
    this.updateRecommendation(freq);
  }

  updateRecommendation(freq: number) {
    this.displayedMeals = this.mealDatabase[freq] || [];
    // Hitung total kalori dari meal yang ditampilkan
    this.currentTotalCalories = this.displayedMeals.reduce((sum, item) => sum + item.calories, 0);
  }

  selectDay(index: number) {
    this.selectedDayIndex = index;
  }

  // --- UTILS ---
  calculateBMI(w: number, h: number): number {
    if (!h) return 0;
    const heightM = h / 100;
    return parseFloat((w / (heightM * heightM)).toFixed(1));
  }

  getBodyFatCategory(cat: number): string {
    const categories = ['Essential Fat', 'Athletes', 'Fitness', 'Average', 'Obese'];
    return categories[cat - 1] || 'Average';
  }

  getGoalDescription(goal: string): string {
    if (goal === 'Muscle Gain') return 'Focus on hypertrophy and strength to build muscle mass.';
    if (goal === 'Weight Loss') return 'High intensity cardio and deficit calories to burn fat.';
    return 'Balanced workout to maintain health.';
  }
}