import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BmiCardComponent, ButtonComponent } from '../../../shared/components';

// ==========================================
// INTERFACES
// ==========================================

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
  bodyFat: { percentage : string, category : string; image: string; }; 
  gender: 'Male' | 'Female';
  program: { title: string; description: string; image: string; };
  level: string;
  freq: number;
}

interface MealItem {
  name: string;
  porsi: string; 
  calories: number;
  protein: string;
  image: string;
}

interface NutritionData {
  targetCalories: number;
  meals: MealItem[];
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
    id: '', name: 'Guest', height: 0, weight: 0, bmi: 0,
    bodyFat: { percentage:'', category:'', image:'' },
    gender: 'Female',
    program: { title: 'Loading...', description: '', image: '' },
    level:'', freq:0,
  };

  nutritionData: NutritionData | null = null;
  
  // Workout State
  workoutMode: 'home' | 'gym' = 'home';
  homeWorkouts: Workout[] = []; 
  gymWorkouts: Workout[] = [];   
  
  isLoading: boolean = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadDataFromStorage();
  }

  loadDataFromStorage() {
    this.isLoading = true;
    const storedData = localStorage.getItem('ml_result');
    
    if (!storedData) {
      this.router.navigate(['/onboarding']);
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      const profile = parsed.userProfile;
      const workoutRec = parsed.workoutRecommendation;
      
      // Ambil Meal Data (Hardcoded freq3 sesuai logic onboarding)
      const mealRec = parsed.mealRecommendation?.freq3;

      // 1. MAPPING USER PROFILE
      const heightM = profile.Height_cm / 100;
      const bmiVal = heightM > 0 ? parseFloat((profile.Weight_kg / (heightM * heightM)).toFixed(1)) : 0;
      const bfInfo = this.getBodyFatInfo(profile.Body_Fat_Category, profile.Gender);
      
      // Fix Program Info (Mapping Goal ke Title/Desc)
      const progInfo = this.getProgramInfo(profile.Goal);

      this.userData = {
        id: 'guest_01', name: 'Guest User',
        height: profile.Height_cm, weight: profile.Weight_kg, bmi: bmiVal,
        gender: profile.Gender === 'Male' ? 'Male' : 'Female',
        bodyFat: { 
            percentage: `${profile.Body_Fat_Percentage}%`, 
            category: bfInfo.label, 
            image: bfInfo.image 
        },
        program: { 
            title: profile.Goal, 
            description: progInfo.description, 
            image: progInfo.image 
        },
        level: profile.Level, 
        freq: profile.Frequency
      };

      // 2. MAPPING MEAL (Langsung Frequency 3)
      this.mapMealData(mealRec);

      // 3. MAPPING WORKOUT
      const rawHome = workoutRec?.home?.workout_plan;
      this.homeWorkouts = this.flattenWorkoutPlan(rawHome, 'home');
      
      const rawGym = workoutRec?.gym?.workout_plan;
      this.gymWorkouts = this.flattenWorkoutPlan(rawGym, 'gym');

    } catch (e) {
      console.error('Error parsing data', e);
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // LOGIC MAPPING MEAL
  // ==========================================
  mapMealData(mealData: any) {
    if (!mealData) return;

    let mappedMeals: MealItem[] = [];
    const mealPlanList = mealData.meal_plan || [];

    if (Array.isArray(mealPlanList)) {
      mappedMeals = mealPlanList.map((m: any) => ({
        name: m.menu_name || 'Healthy Food',
        porsi: `${m.portion || 1} Portion`,
        calories: Math.round(m.calories || 0),
        protein: `${(m.protein || 0).toFixed(1)}g`,
        image: 'assets/food-placeholder.jpg' // Ganti dengan path image default kamu
      }));
    }

    const totalCal = mealData.planned_total?.calories || mealData.target_daily?.calories || 2000;

    this.nutritionData = {
      targetCalories: Math.round(totalCal),
      meals: mappedMeals
    };
  }

  // ==========================================
  // HELPERS
  // ==========================================
  
  private flattenWorkoutPlan(planObj: any, type: 'home' | 'gym'): Workout[] {
    if (!planObj || typeof planObj !== 'object') return [];
    let allExercises: Workout[] = [];
    let idCounter = 1;
    
    // Urutkan hari (Monday, Tuesday, etc) jika perlu, atau iterasi object keys
    Object.keys(planObj).forEach(dayKey => {
        const exercises = planObj[dayKey];
        if (Array.isArray(exercises)) {
            const mapped = exercises.map((ex: any) => ({
                id: idCounter++,
                category: ex.muscle_group || 'General',
                name: ex.exercise_name || 'Exercise',
                description: ex.instructions || `Lakukan ${ex.sets} set x ${ex.reps} repetisi.`,
                sets: ex.sets || 3,
                reps: String(ex.reps || '12'),
                type: type
            }));
            allExercises = allExercises.concat(mapped);
        }
    });
    return allExercises;
  }

  getBodyFatInfo(catId: number, gender: string) {
    const isFemale = (gender || '').toLowerCase() === 'female';
    const prefix = isFemale ? 'female' : 'male';
    // Path image sesuaikan dengan folder assets kamu
    const basePath = '/global/body-fat/'; 
    
    switch(catId) {
      case 1: return { label: 'Essential', image: `${basePath}${prefix}_veryLean.svg` };
      case 2: return { label: 'Athlete', image: `${basePath}${prefix}_athletic.svg` };
      case 3: return { label: 'Fitness', image: `${basePath}${prefix}_average.svg` };
      case 4: return { label: 'Average', image: `${basePath}${prefix}_overweight.svg` };
      case 5: return { label: 'Obese', image: `${basePath}${prefix}_obese.svg` };
      default: return { label: 'Average', image: `${basePath}${prefix}_average.svg` };
    }
  }

  getProgramInfo(goal: string) {
    // Sesuaikan path image program kamu
    if (goal === 'Muscle Gain') {
      return { description: 'Focus on hypertrophy and strength building.', image: '/global/workout-type/muscleGain_transparent_background.svg' };
    } else if (goal === 'Weight Loss') {
      return { description: 'High intensity cardio and calorie deficit.', image: '/global/workout-type/weightLoss_transparent_background.svg' };
    } else {
      return { description: 'Maintain overall fitness and stability.', image: '/global/workout-type/maintain_transparent_background.svg' };
    }
  }

  // ==========================================
  // UI LOGIC (Preview Limit)
  // ==========================================
  
  setMode(mode: 'home' | 'gym') { 
    this.workoutMode = mode; 
  }

  // Getter ini hanya mengambil 3 workout pertama untuk preview
  get previewWorkouts() {
    const all = this.workoutMode === 'home' ? this.homeWorkouts : this.gymWorkouts;
    return all.slice(0, 3); // LIMIT HANYA 3
  }
}