import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BmiCardComponent } from '../../../shared/components';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [CommonModule, BmiCardComponent, FormsModule],
  templateUrl: './recommendation.html',
  styleUrl: './recommendation.css',
})
export class RecommendationPage implements OnInit {

  // State Variables
  activeTab: 'home' | 'gym' = 'home';
  selectedDayIndex: number = 0;
  
  // Data Containers
  workoutSchedule: any[] = []; 
  userProfile: any = {}; 
  userTarget: any = {};
  userRoutine: any = {};

  // Meal State
  selectedFrequency: number = 3; 
  displayedMeals: any[] = [];   
  currentTotalCalories: number = 0;
  mealDatabase: Record<number, any[]> = {};

  constructor() {} 

  ngOnInit(): void {
    this.loadReadyData();
  }

  loadReadyData() {
    const data = localStorage.getItem('ml_data_ready');
    if (!data) return;

    try {
      const parsed = JSON.parse(data);
      
      // 1. Ambil Section Data
      const profile = parsed.userProfile || {};
      const workoutHome = parsed.workoutRecommendation?.home?.workout_plan || {};
      const workoutGym = parsed.workoutRecommendation?.gym?.workout_plan || {};
      const mealRecs = parsed.mealRecommendation || {};
      const roadmap = parsed.progressRecommendation?.roadmap || [];

      const bodyFatInfo = this.getBodyFatInfo(profile.bodyFatCategory, profile.gender);

      // 2. MAPPING USER PROFILE (Header Kiri & Kanan)
      this.userProfile = {
        height: profile.height,
        weight: profile.weight,
        bmi: (profile.weight / Math.pow(profile.height/100, 2)).toFixed(1),
        bodyFat: {
          percentage: `${profile.bodyFatPercentage}%`,
          category: bodyFatInfo.label, 
          image: bodyFatInfo.image, 
        },
        gender: profile.gender,
        program: {
          title: profile.goal, // e.g. "Weight Loss"
          description: this.getGoalDescription(profile.goal),
          image: 'pages/recommendation/cardio.png'
        },
        level: profile.level,
        freq: profile.frequency
      };

      // 3. MAPPING USER ROUTINE & TARGET (Untuk Card Tengah & Kiri)
      const finalWeek = roadmap.length > 0 ? roadmap[roadmap.length - 1] : null;
      this.userTarget = {
        weightTarget: finalWeek?.physical?.weight_kg || profile.weight, 
        bodyFatTarget: 18 // Default ideal target
      };

      this.userRoutine = {
        level: profile.level,
        freq: profile.frequency,
        avg_dur: profile.duration
      };

      // 4. MAPPING WORKOUT SCHEDULE (Penting: Mapping Day Keys)
      // Struktur Home: { "Day 1 - Full Body": [...], "Day 2 ...": [...] }
      const homeKeys = Object.keys(workoutHome);
      const gymKeys = Object.keys(workoutGym);

      // Kita mapping berdasarkan Home Keys sebagai acuan hari
      this.workoutSchedule = homeKeys.map((dayKey, index) => {
        // Cari key Gym yang ekuivalen (biasanya urutan indexnya sama)
        const gymKey = gymKeys[index] || null; 

        return {
          day: index + 1,
          title: dayKey, // e.g. "Day 1 - Full Body Push"
          env: {
            home: this.mapWorkoutDetails(workoutHome[dayKey]),
            gym: gymKey ? this.mapWorkoutDetails(workoutGym[gymKey]) : { exercises: [] }
          }
        };
      });

      // 5. MAPPING MEAL RECOMMENDATION (Critical Fix)
      // JSON Struktur: { freq2: {...}, freq3: {...} }
      
      // Kita loop array frekuensi yang mungkin ada
      [2, 3, 4, 5].forEach(freq => {
          const key = `freq${freq}`; // e.g. "freq3"
          if (mealRecs[key] && mealRecs[key].meal_plan) {
              this.mealDatabase[freq] = this.mapMeals(mealRecs[key].meal_plan);
          } else {
              this.mealDatabase[freq] = [];
          }
      });

      // Set default tampilan awal
      this.selectedFrequency = profile.frequency || 3; 
      // Jika data freq terpilih kosong, fallback ke 3
      if (!this.mealDatabase[this.selectedFrequency]?.length) {
          this.selectedFrequency = 3;
      }
      
      this.updateRecommendation(this.selectedFrequency);

    } catch (e) { 
      console.error("Error parsing ML Data", e); 
    }
  }

  // --- HELPER WORKOUT ---
  mapWorkoutDetails(exercises: any[]): any {
    if (!exercises || !Array.isArray(exercises)) return { exercises: [] };

    // Hitung Total Stats untuk ditampilkan di Card jika perlu (walaupun HTML kamu tidak pakai equipment/duration total di list, tapi good to have)
    return {
      exercises: exercises.map(ex => ({
        name: ex.exercise_name,
        muscle: ex.muscle_group,
        sets: ex.sets,
        reps: String(ex.reps),
        cals: ex.calories_burned,
        // Gambar sudah disiapkan oleh Main Dashboard di 'ml_data_ready'
        // Jika null/undefined, pakai placeholder
        type:ex.type,
        image: ex.imageUrl || 'assets/images/placeholder_exercise.png' 
      }))
    };
  }

  // --- HELPER MEAL ---
  mapMeals(mealsData: any[]): any[] {
    if (!mealsData || !Array.isArray(mealsData)) return [];
    
    // HTML kamu menggunakan path image statis (dummyImages)
    // Kita rotasi gambar agar bervariasi
    const dummyImages = [
        'pages/steak.png', 
        'pages/salmon.png', 
        'pages/chicken.png', 
        'pages/oatmeal.png', 
        'pages/fish.png'
    ];
    
    return mealsData.map((m, i) => ({
      name: m.menu_name, 
      porsi: `${m.portion} Portion`, 
      calories: Math.round(Number(m.calories)), 
      // HTML kamu butuh protein, tapi data JSON 'protein' itu angka (e.g. 43.1)
      // HTML pipe: {{ food.calories * 0.15 ... }} <- ini logika HTML kamu sebelumnya
      // Sebaiknya kita siapkan di TS saja agar HTML bersih, tapi karena HTML tidak boleh diubah:
      // Kita kirim raw object yang properti-nya sesuai yang diminta HTML 'food.calories'
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
      
      // Hitung Total Kalori dari meal yang ditampilkan
      this.currentTotalCalories = this.displayedMeals.reduce((sum, item) => sum + item.calories, 0); 
  }

  isDropdownOpen: boolean = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectDay(index: number) { 
    this.selectedDayIndex = index; 
    this.selectDay(index); // Panggil fungsi selectDay yang sudah kamu punya
    this.isDropdownOpen = false;
  }

  isFreqDropdownOpen: boolean = false;

  toggleFreqDropdown() {
    this.isFreqDropdownOpen = !this.isFreqDropdownOpen;
  }

  selectFrequency(val: number) {
    this.selectedFrequency = val;
    this.onDayChange({ target: { value: val } });
    this.isFreqDropdownOpen = false;
  }
  
  // --- UTILS ---
  getBodyFatInfo(catId: number, gender: string) {
    const prefix = (gender || '').toLowerCase() === 'female' ? 'female' : 'male'; 
    switch(catId) {
      case 1: return { label: 'VeryLean', image: `/global/body-fat/${prefix}_veryLean.svg` };
      case 2: return { label: 'Athlete', image: `/global/body-fat/${prefix}_athletic.svg` };
      case 3: return { label: 'Average', image: `/global/body-fat/${prefix}_average.svg` };
      case 4: return { label: 'Overweight', image: `/global/body-fat/${prefix}_overweight.svg` };
      case 5: return { label: 'Obese', image: `/global/body-fat/${prefix}_obese.svg` };
      default: return { label: 'Average', image: `/global/body-fat/${prefix}_average.svg` };
    }
  }

  getGoalDescription(goal: string): string {
    if (goal === 'Muscle Gain') return 'Focus on hypertrophy and strength.';
    if (goal === 'Weight Loss') return 'High intensity cardio and deficit calories.';
    return 'Balanced workout to maintain health.';
  }
}