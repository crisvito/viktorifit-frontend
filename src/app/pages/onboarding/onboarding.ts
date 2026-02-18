import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'; 
import { BmiCardComponent } from '../../shared/components';
import { forkJoin, of } from 'rxjs';
import { switchMap, tap, map, finalize } from 'rxjs/operators';
import { environment } from '../../../environment/environment'; 
import { AuthService } from '../../core';

// ==========================================
// 1. INTERFACES (Payload ML)
// ==========================================

interface WorkoutPayload {
  Age: number;
  Gender: string;
  Height_cm: number;
  Weight_kg: number;
  Body_Fat_Category: number;
  Body_Fat_Percentage: number;
  Goal: string;
  Frequency: number;
  Duration: number;
  Level: string;
  Environment: string; 
  Badminton: number;
  Football: number;
  Basketball: number;
  Volleyball: number;
  Swim: number;
}

interface UserProgressPayload {
  Age: number;
  Gender: string;
  Height_cm: number;
  Initial_Weight_kg: number; 
  Goal: string;
  Level: string;
  Body_Fat_Category: number;
  Body_Fat_Percentage: number;
  Frequency: number;
  Duration: number;
  Badminton: number;
  Football: number;
  Basketball: number;
  Volleyball: number;
  Swim: number;
}

interface MealPayload {
  Daily_Calories: number;
  Target_Protein_g: number;
  Target_Carbs_g: number;
  Target_Fat_g: number;
  Frequency: number;
}

// ... Type definitions UI ...
type Gender = 'male' | 'female' | '';
type Goal = 'Muscle Gain' | 'Weight Loss' | 'Maintain';
type WorkoutDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type Sport = 'badminton' | 'football' | 'basketball' | 'volley' | 'swim';

interface Bodyfat {
  label: string;
  range: string;
  value: number;
  category: number;
  image: string;
}

interface WorkoutDuration {
  duration: number;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule, BmiCardComponent], 
  templateUrl: './onboarding.html',
  styleUrls: ['./onboarding.css']
})
export class OnboardingPage {

  currentStep = 0;
  isLoading = false;
  isSubmitting = false; 
  loadingText = 'Menyimpan Data...';

  // State Form Data
  formData = {
    gender: '' as Gender,
    birthDate: '',
    height: null as number | null,
    weight: null as number | null,
    bodyFat: null as number | null,
    bodyFatCategory: null as number | null,
    frequency: null as number | null,
    sports: [] as Sport[],
    goal: '' as Goal,
    level: '', // TAMBAHAN UNTUK LEVEL
    workoutDuration: null as number | null,
    workoutDays: [] as WorkoutDay[]
  };

  birthDay: number | null = null;
  birthMonth: number | null = null;
  birthYear: number | null = null;

  workoutDaysList: WorkoutDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  // ==========================================
  // DATA OPTIONS
  // ==========================================
  maleBodyFatOptions: Bodyfat[] = [
    { label: 'Essential', range: '2-5%', value: 4, category: 1, image: '/global/body-fat/male_veryLean.svg' },
    { label: 'Athlete', range: '6-13%', value: 10, category: 2, image: '/global/body-fat/male_athletic.svg' },
    { label: 'Fitness', range: '14-17%', value: 15, category: 3, image: '/global/body-fat/male_average.svg' },
    { label: 'Average', range: '18-24%', value: 21, category: 4, image: '/global/body-fat/male_overweight.svg' },
    { label: 'Obese', range: '25%+', value: 30, category: 5, image: '/global/body-fat/male_obese.svg' }
  ];

  femaleBodyFatOptions: Bodyfat[] = [
    { label: 'Essential', range: '10-13%', value: 12, category: 1, image: 'global/body-fat/female_veryLean.svg' },
    { label: 'Athlete', range: '14-20%', value: 17, category: 2, image: '/global/body-fat/female_athletic.svg' },
    { label: 'Fitness', range: '21-24%', value: 22, category: 3, image: '/global/body-fat/female_average.svg' },
    { label: 'Average', range: '25-31%', value: 28, category: 4, image: '/global/body-fat/female_overweight.svg' },
    { label: 'Obese', range: '32%+', value: 35, category: 5, image: '/global/body-fat/female_obese.svg' }
  ];

  workoutDuration: WorkoutDuration[] = [
    { duration: 30}, { duration: 45}, { duration: 60}, { duration: 90}
  ];

  sportsOptions: { id: Sport, label: string, icon: string }[] = [
    { id: 'badminton', label: 'Badminton', icon: '🏸' },
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'basketball', label: 'Basket', icon: '🏀' },
    { id: 'volley', label: 'Volley', icon: '🏐' },
    { id: 'swim', label: 'Swimming', icon: '🏊' }
  ];

  ngOnInit() {
    const user = this.authService.getUser();
    const isLoggedIn = this.authService.isLoggedIn();

    if (isLoggedIn && user) {
      const profile = user.userProfileDTO;
      const hasProfile = profile && (profile.age !== null || profile.dob !== null);

      if (hasProfile) {
        this.router.navigate(['/dashboard']);
        return;
      }
    }

    const existingData = localStorage.getItem('ml_result');
    if (existingData) {
      this.router.navigate(['/suggestion-result']);
    }
  }
  
  // ==========================================
  // LOGIC SELECTION
  // ==========================================
  get currentBodyFatOptions(): Bodyfat[] {
    return this.formData.gender === 'female' ? this.femaleBodyFatOptions : this.maleBodyFatOptions;
  }
  selectBodyFat(option: Bodyfat) {
    this.formData.bodyFat = option.value;
    this.formData.bodyFatCategory = option.category;
  }
  selectDuration(option: WorkoutDuration) { this.formData.workoutDuration = option.duration; }
  toggleSport(sport: Sport) {
    const idx = this.formData.sports.indexOf(sport);
    if (idx > -1) this.formData.sports.splice(idx, 1);
    else this.formData.sports.push(sport);
  }
  selectGoal(goal: Goal) { this.formData.goal = goal; }
  
  // FUNGSI BARU UNTUK LEVEL
  selectLevel(level: string) { this.formData.level = level; }

  selectDay(day: WorkoutDay) {
    const index = this.formData.workoutDays.indexOf(day);
    if (index > -1) {
      this.formData.workoutDays.splice(index, 1);
    } else {
      this.formData.workoutDays.push(day);
    }
  }

  selectGender(gender: Gender) { this.formData.gender = gender; }

  // ==========================================
  // HELPER FORMAT DOB & AGE
  // ==========================================
  private formatDob(year: number, month: number, day: number): string {
    const m = month.toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  get calculatedAge(): number {
    const currentYear = new Date().getFullYear();
    return this.birthYear ? (currentYear - this.birthYear) : 25; // Default 25
  }

  private formatDaysForDB(days: WorkoutDay[]): string {
    const map: { [key: string]: string } = {
      monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
      friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
    };
    return days.map(d => map[d] || d).join(',');
  }

  // ==========================================
  // MAIN SUBMIT LOGIC (SUPER FAST - HOME ONLY)
  // ==========================================
  startLoadingProcess() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    this.isLoading = true;
    this.loadingText = 'Menyimpan Data...';
    
    this.submit(); 
  }

  submit() {
    this.loadingText = 'Menganalisa Personalisasi...';

    const age = this.calculatedAge;
    const gender = this.formData.gender === 'male' ? 'Male' : 'Female';
    const height = this.formData.height || 170;
    const weight = this.formData.weight || 60;
    const freq = this.formData.workoutDays.length;
    const duration = this.formData.workoutDuration || 60;
    
    const s = this.formData.sports;
    const sportsMap = {
      Badminton: s.includes('badminton') ? 1 : 0,
      Football: s.includes('football') ? 1 : 0,
      Basketball: s.includes('basketball') ? 1 : 0,
      Volleyball: s.includes('volley') ? 1 : 0,
      Swim: s.includes('swim') ? 1 : 0
    };

    const basePayload = {
      Age: age,
      Gender: gender,
      Height_cm: height,
      Weight_kg: weight,
      Body_Fat_Category: this.formData.bodyFatCategory || 2,
      Body_Fat_Percentage: this.formData.bodyFat || 15.0,
      Goal: this.formData.goal,
      Frequency: freq,
      Duration: duration,
      Level: this.formData.level || 'Beginner', // MENGGUNAKAN LEVEL DARI FORM
      ...sportsMap
    };

    // HANYA Payload Home
    const homePayload: WorkoutPayload = { ...basePayload, Environment: 'Home' };
    
    const progressPayload: UserProgressPayload = {
      ...basePayload,
      Initial_Weight_kg: weight, 
    };

    const baseUrl = `${environment.apiUrl}ml`; 

    // Step 1: Request Workout (HOME ONLY) & Progress
    forkJoin({
      workoutHome: this.http.post(`${baseUrl}/workout-recommendation`, homePayload),
      progressResult: this.http.post<any>(`${baseUrl}/userprogress-recommendation`, progressPayload) 
    }).pipe(
      // Step 2: Request Meal Plan (Single Request - Optimized)
      switchMap((results: any) => {
        const progressData = results.progressResult;
        let week1: any = null;
        if (progressData && Array.isArray(progressData.roadmap) && progressData.roadmap.length > 0) {
            week1 = progressData.roadmap[0]; 
        } else if (Array.isArray(progressData) && progressData.length > 0) {
            week1 = progressData[0];
        }

        if (!week1 || !week1.nutrition || !week1.macro) {
            throw new Error('Gagal mendapatkan data progress');
        }

        this.loadingText = 'Menyusun Meal Plan...';

        const mealPayload: MealPayload = {
          Daily_Calories: week1.nutrition.calories, 
          Target_Protein_g: week1.macro.protein_g,
          Target_Carbs_g: week1.macro.carbs_g,
          Target_Fat_g: week1.macro.fat_g,
          Frequency: 3 // Fixed 3 meals
        };

        return this.http.post(`${baseUrl}/meal-recommendation`, mealPayload).pipe(
          map(mealResult => ({
            ...results,
            mealResult: { freq3: mealResult }
          }))
        );
      }),
      // Step 3: Save Data & Sync Profile
      switchMap((allResults: any) => {
        const daysString = this.formatDaysForDB(this.formData.workoutDays);

        const finalData = {
          userProfile: { 
            ...homePayload, 
            workoutDays: daysString, 
            dob: this.formatDob(this.birthYear||2000, this.birthMonth||1, this.birthDay||1) 
          },
          workoutRecommendation: {
            home: allResults.workoutHome,
            gym: null // SET NULL (Locked)
          },
          progressRecommendation: allResults.progressResult,
          mealRecommendation: allResults.mealResult 
        };

        localStorage.setItem('ml_result', JSON.stringify(finalData));

        if (this.authService.isLoggedIn()) {
          const gp = finalData.userProfile;
          const profilePayload = {
            dob: gp.dob,
            gender: gp.Gender,
            height: gp.Height_cm,
            weight: gp.Weight_kg,
            goal: gp.Goal,
            level: gp.Level,
            bodyFatCategory: gp.Body_Fat_Category,
            bodyFatPercentage: gp.Body_Fat_Percentage,
            frequency: gp.Frequency,
            duration: gp.Duration,
            workoutDays: gp.workoutDays, 
            badminton: gp.Badminton,
            football: gp.Football,
            basketball: gp.Basketball,
            volleyball: gp.Volleyball,
            swim: gp.Swim
          };

          return this.http.post(`${environment.apiUrl}profile/create`, profilePayload).pipe(
            tap((savedProfile: any) => {
              this.authService.updateUserSession(savedProfile);
              localStorage.removeItem('ml_result');
            })
          );
        } else {
          return of(null);
        }
      }),
      finalize(() => {
        this.isLoading = false;
        this.isSubmitting = false;
      })
    ).subscribe({
      next: () => {
        if (this.authService.isLoggedIn()) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/suggestion-result']);
        }
      },
      error: (err) => {
        console.error('Error Processing:', err);
        alert('Gagal memproses rekomendasi.');
      }
    });
  }

  // ==========================================
  // NAVIGATION & VALIDATION
  // ==========================================

  canContinue(): boolean {
    switch (this.currentStep) {
      case 0: return true;
      case 1: return this.formData.gender !== '';
      case 2: return this.isBirthDateValid();
      case 3: 
        const h = this.formData.height;
        const w = this.formData.weight;
        return (h !== null && h >= 50 && h <= 250) && 
               (w !== null && w >= 30 && w <= 250);
      case 4: return this.formData.bodyFat !== null; 
      case 5: return true; 
      case 6: 
        const d = this.formData.workoutDuration;
        return d !== null && d >= 15 && d <= 150;
      case 7: return true;
      case 8: return !!this.formData.level; // VALIDASI STEP LEVEL
      case 9: return !!this.formData.goal;
      case 10: return this.formData.workoutDays.length > 0;
      default: return false;
    }
  }

  next() {
    if (this.canContinue()) {
      if (this.currentStep === 10) {
        this.startLoadingProcess();
      } else {
        this.currentStep++;
        window.scrollTo(0, 0);
      }
    }
  }

  previous() {
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo(0, 0);
    }
  }

  nextStep() { this.currentStep = 1; }
  
  getMaxDays(month: number | null, year: number | null): number {
    if (!month) return 31; 
    const y = year || 2024;
    return new Date(y, month, 0).getDate();
  }

  isBirthDateValid(): boolean {
    if (!this.birthDay || !this.birthMonth || !this.birthYear) return false;
    const d = this.birthDay;
    const m = this.birthMonth;
    const y = this.birthYear;
    const currentYear = new Date().getFullYear();
    if (y < (currentYear - 70) || y > (currentYear - 13)) return false;
    if (m < 1 || m > 12) return false;
    const maxDay = this.getMaxDays(m, y);
    if (d < 1 || d > maxDay) return false;
    return true;
  }

  get age(): number { return this.calculatedAge; }

  validateDay(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');
    if (val) {
      let num = parseInt(val, 10);
      const maxDays = this.getMaxDays(this.birthMonth, this.birthYear);
      if (val.length === 1 && num > 3) val = '0' + val;
      if (parseInt(val, 10) > maxDays) val = val.slice(0, -1); 
    }
    input.value = val;
    this.birthDay = val ? parseInt(val, 10) : null;
  }

  validateMonth(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');
    if (val) {
      if (val.length === 1 && parseInt(val, 10) > 1) val = '0' + val;
      if (parseInt(val, 10) > 12) val = val.slice(0, -1);
    }
    input.value = val;
    this.birthMonth = val ? parseInt(val, 10) : null;
    if (this.birthDay) {
      const maxDays = this.getMaxDays(this.birthMonth, this.birthYear);
      if (this.birthDay > maxDays) this.birthDay = maxDays; 
    }
  }

  validateYear(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length === 4) {
         const num = parseInt(val, 10);
         if (num >= 2015) val = val.slice(0, -1);
    }
    input.value = val;
    this.birthYear = val ? parseInt(val, 10) : null;
  }

  onBirthKey(event: KeyboardEvent, nextInput?: HTMLInputElement) {
    const input = event.target as HTMLInputElement;
    const val = input.value;
    if (event.key === 'ArrowRight' && nextInput) {
        nextInput.focus();
        return;
    }
    if (val.length === input.maxLength && nextInput && event.key !== 'Backspace') {
        nextInput.focus();
    }
  }

  onCalendarChange(event: any) {
    const val = event.target.value;
    if (val) {
      const [y, m, d] = val.split('-');
      this.birthYear = parseInt(y, 10);
      this.birthMonth = parseInt(m, 10);
      this.birthDay = parseInt(d, 10);
    }
  }

  onBodyKey(event: KeyboardEvent, nextInput: HTMLInputElement | null) {
    if (['e', 'E', '+', '-'].includes(event.key)) event.preventDefault();
    if (event.key === 'Enter' && nextInput) nextInput.focus();
  }

  get selectedGender() { return this.formData.gender; }
  get selectedBodyFatInfo(): Bodyfat {
    const selected = this.currentBodyFatOptions.find(opt => opt.value === this.formData.bodyFat);
    return selected ? selected : { image: '', label: '-', range: '', value: 0, category: 0 };
  }
  get selectedBodyFatLabel(): string { return this.selectedBodyFatInfo.label; }
  
  get bmiDisplay(): string {
    const h = this.formData.height;
    const w = this.formData.weight;
    if (h && w && h > 0) {
      const bmi = w / Math.pow(h / 100, 2);
      return bmi.toFixed(1);
    }
    return '0.0';
  } 

  get selectedGoal() { return this.formData.goal; }
  get selectedDay() { return this.formData.workoutDays; }
}