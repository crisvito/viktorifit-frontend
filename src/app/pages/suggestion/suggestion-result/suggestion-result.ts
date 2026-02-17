import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Penting buat ngModel dropdown
import { BmiCardComponent, ButtonComponent } from '../../../shared/components';

// ... (Interface Workout, UserWellnessProfile SAMA SEPERTI SEBELUMNYA) ...
// ... (Interface MealItem, NutritionData SAMA SEPERTI SEBELUMNYA) ...

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
  freq:number;
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
    FormsModule, // Tambahkan ini
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
  
  // Meal Frequency State
  mealFrequencyOptions = [2, 3, 4, 5];
  selectedMealFreq: number = 3; // Default 3 kali makan
  allMealRecommendations: any = null; // Simpan raw data { freq2, freq3... }

  isLoading: boolean = true;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadDataFromStorage();
  }

  loadDataFromStorage() {
    this.isLoading = true;
    const storedData = localStorage.getItem('guest_ml_result');
    
    if (!storedData) {
      this.router.navigate(['/onboarding']);
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      const profile = parsed.userProfile;
      const workoutRec = parsed.workoutRecommendation;
      
      // Simpan SEMUA data meal (freq2, freq3, freq4, freq5) ke variable global
      this.allMealRecommendations = parsed.mealRecommendation; 

      // 1. MAPPING USER PROFILE (SAMA)
      const heightM = profile.Height_cm / 100;
      const bmiVal = heightM > 0 ? parseFloat((profile.Weight_kg / (heightM * heightM)).toFixed(1)) : 0;
      const bfInfo = this.getBodyFatInfo(profile.Body_Fat_Category, profile.Gender);
      const progInfo = this.getProgramInfo(profile.Goal);

      this.userData = {
        id: 'guest_01', name: 'Guest User',
        height: profile.Height_cm, weight: profile.Weight_kg, bmi: bmiVal,
        gender: profile.Gender,
        bodyFat: { percentage: `${profile.Body_Fat_Percentage}%`, category: bfInfo.label, image: bfInfo.image },
        program: { title: profile.Goal, description: progInfo.description, image: progInfo.image },
        level: profile.Level, freq: profile.Frequency
      };

      // 2. MAPPING MEAL (Set Default ke Frequency 3)
      this.changeMealFreq(3);

      // 3. MAPPING WORKOUT (SAMA)
      const rawHome = workoutRec?.home?.workout_plan;
      this.homeWorkouts = this.flattenWorkoutPlan(rawHome, 'home');
      const rawGym = workoutRec?.gym?.workout_plan;
      this.gymWorkouts = this.flattenWorkoutPlan(rawGym, 'gym');

    } catch (e) {
    } finally {
      this.isLoading = false;
    }
  }

  // ==========================================
  // LOGIC GANTI FREQUENCY MEAL
  // ==========================================
  changeMealFreq(freq: number) {
    this.selectedMealFreq = freq; // Update state untuk dropdown

    if (!this.allMealRecommendations) return;

    // Ambil data spesifik berdasarkan key (freq2, freq3, dst)
    const key = `freq${freq}`;
    const specificMealData = this.allMealRecommendations[key];

    // Mapping ulang data Nutrition berdasarkan pilihan frequency
    let mappedMeals: MealItem[] = [];
    const mealPlanList = specificMealData?.meal_plan || [];

    if (Array.isArray(mealPlanList) && mealPlanList.length > 0) {
      mappedMeals = mealPlanList.map((m: any) => ({
        name: m.menu_name || 'Food Item',
        porsi: `${m.portion || 1} Portion`,
        calories: Math.round(m.calories || 0),
        protein: `${(m.protein || 0).toFixed(1)}g`,
        image: 'assets/food-placeholder.jpg'
      }));
    }

    const totalCal = specificMealData?.planned_total?.calories || specificMealData?.target_daily?.calories || 2000;

    this.nutritionData = {
      targetCalories: Math.round(totalCal),
      meals: mappedMeals
    };
  }

  // ==========================================
  // HELPERS (flattenWorkoutPlan, getBodyFatInfo, getProgramInfo) 
  // ... (Paste method helper yang SAMA DARI SEBELUMNYA di sini) ...
  // ==========================================
  
  private flattenWorkoutPlan(planObj: any, type: 'home' | 'gym'): Workout[] {
    if (!planObj || typeof planObj !== 'object') return [];
    let allExercises: Workout[] = [];
    let idCounter = 1;
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
    switch(catId) {
      case 1: 
        return { label: 'Essential', image: `global/body-fat/${prefix}_veryLean.svg` };
      case 2: 
        return { label: 'Athlete', image: `global/body-fat/${prefix}_athletic.svg` };
      case 3: 
        return { label: 'Fitness', image: `global/body-fat/${prefix}_average.svg` };
      case 4: 
        return { label: 'Average', image: `global/body-fat/${prefix}_overweight.svg` };
      case 5: 
        return { label: 'Obese', image: `global/body-fat/${prefix}_obese.svg` };
      default: 
        return { label: 'Average', image: `global/body-fat/${prefix}_average.svg` };
    }
  }

  getProgramInfo(goal: string) {
    if (goal === 'Muscle Gain') {
      return { description: 'Fokus hipertrofi otot.', image: 'pages/suggestion/weight.png' };
    } else if (goal === 'Weight Loss') {
      return { description: 'Fokus pembakaran kalori.', image: 'pages/suggestion/cardio.png' };
    } else {
      return { description: 'Kebugaran umum.', image: 'pages/suggestion/yoga.png' };
    }
  }

  // UI Logic
  get filteredWorkouts() {
    return this.workoutMode === 'home' ? this.homeWorkouts : this.gymWorkouts;
  }
  setMode(mode: 'home' | 'gym') { this.workoutMode = mode; }

}

