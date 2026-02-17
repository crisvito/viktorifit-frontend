import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmiCardComponent } from '../../../shared/components';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../../core'; // Import Service

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
  styleUrl: './recommendation.css',
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
  
  mealDatabase: Record<number, Meal[]> = {};

  // Cache untuk Master Data Exercise (biar gak bolak balik request)
  private masterExercises: any[] = [];

  constructor(private exerciseService: ExerciseService) {} // Inject Service

  ngOnInit(): void {
    // Panggil Master Data dulu, baru load ML Data
    this.exerciseService.getAllExercises().subscribe({
      next: (exercises) => {
        this.masterExercises = exercises;
        this.loadMLData(); // Load data setelah master data siap
      },
      error: (err) => {
        console.error('Gagal load master exercise, gambar mungkin tidak muncul', err);
        this.loadMLData(); // Tetap load data meski tanpa gambar
      }
    });
  }


  getBodyFatInfo(catId: number, gender: string) {
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
          category: bodyFatInfo.label, 
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

      // B. MAP USER TARGET
      const roadmap = parsed.progressRecommendation?.roadmap || [];
      const finalWeek = roadmap.length > 0 ? roadmap[roadmap.length - 1] : null;
      
      this.userTarget = {
        weightTarget: finalWeek?.physical?.weight_kg || profile.weight, 
        bodyFatTarget: 18 
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
            // Panggil fungsi mapWorkoutDetails yang sudah diupdate
            home: this.mapWorkoutDetails(workoutHome[dayKey]),
            gym: this.mapWorkoutDetails(workoutGym[gymKey])
          }
        };
      });

      // D. MAP MEAL RECOMMENDATION
      this.mealDatabase[2] = this.mapMeals(mealRecs.freq2?.meal_plan);
      this.mealDatabase[3] = this.mapMeals(mealRecs.freq3?.meal_plan);
      this.mealDatabase[4] = this.mapMeals(mealRecs.freq4?.meal_plan);
      this.mealDatabase[5] = this.mapMeals(mealRecs.freq5?.meal_plan);

      this.selectedFrequency = 3; 
      this.updateRecommendation(this.selectedFrequency);

    } catch (e) {
      console.error("Error parsing ML Data", e);
    }
  }

  // --- HELPER MAPPING WORKOUT (UPDATED WITH IMAGE MATCHING) ---
  mapWorkoutDetails(exercises: any[]): WorkoutDetails {
    if (!exercises) return { totalCalories: 0, equipment: [], exercises: [] };

    const totalCals = exercises.reduce((acc, curr) => acc + (Number(curr.calories_burned) || 0), 0);
    
    const allEquip = exercises.map(e => e.equipment).join(',').split(',');
    const uniqueEquip = [...new Set(allEquip.map(s => s.trim()))].filter(s => s && s !== 'None');

    const totalDur = exercises.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0) + (Number(curr.rest_minutes) || 0), 0);

    return {
      totalDuration: `${totalDur} Min`,
      totalCalories: totalCals,
      equipment: uniqueEquip.slice(0, 3), 
      exercises: exercises.map(ex => {
        
        // --- LOGIKA PENCOCOKAN GAMBAR ---
        // Cari latihan di masterExercises yang namanya mirip dengan ex.exercise_name dari ML
        const matchedExercise = this.masterExercises.find(master => 
          master.name.toLowerCase().trim() === ex.exercise_name.toLowerCase().trim()
        );

        // Jika ketemu, ambil ID-nya untuk bikin URL Cloudinary. 
        // Jika tidak, pakai ID dari ML (fallback) atau gambar placeholder
        const realId = matchedExercise ? matchedExercise.id : ex.exerciseId;
        const imageUrl = realId 
          ? `https://res.cloudinary.com/dmhzqtzrr/image/upload/${realId}.gif`
          : 'assets/images/placeholder_exercise.png'; // Ganti dengan path placeholder kamu

        return {
          name: ex.exercise_name,
          muscle: ex.muscle_group,
          sets: ex.sets,
          reps: String(ex.reps),
          cals: ex.calories_burned,
          image: imageUrl // Masukkan URL hasil pencocokan
        };
      })
    };
  }

  // --- HELPER MAPPING MEAL ---
  mapMeals(mealsData: any[]): Meal[] {
    if (!mealsData || !Array.isArray(mealsData)) return [];
    
    const dummyImages = ['pages/steak.png', 'pages/salmon.png', 'pages/chicken.png', 'pages/oatmeal.png', 'pages/fish.png'];
    
    return mealsData.map((m, i) => ({
      name: m.menu_name, 
      porsi: `${m.portion} Portion`, 
      calories: Math.round(Number(m.calories)), 
      protein: `${Math.round(Number(m.protein))}g`,
      carbs: `${Math.round(Number(m.carbs))}g`,
      fat: `${Math.round(Number(m.fat))}g`,
      items: [], 
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