import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BmiCardComponent } from '../../shared/components';

type Gender = 'male' | 'female' | '';
type Goal = 'Muscle Gain' | 'Weight Loss' | 'Maintain';
type WorkoutDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
type Sport = 'badminton' | 'football' | 'basketball' | 'volley' | 'swim';

interface Bodyfat {
  label: string;
  range: string;
  value: number;
  image: string;
}

interface WorkoutDuration{
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
  loadingText = 'Menyimpan Data...';

  formData = {
    gender: '' as Gender,
    birthDate: '',
    height: null as number | null,
    weight: null as number | null,
    bodyFat: null as number | null,
    frequency: null as number | null,
    sports: [] as Sport[],
    goal: '' as Goal,
    workoutDuration: null as number | null,
    workoutDays: [] as WorkoutDay[]
  };

  birthDay: number | null = null;
  birthMonth: number | null = null;
  birthYear: number | null = null;

  workoutDaysList: WorkoutDay[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  constructor(private router: Router) {}

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
      case 8: return !!this.formData.goal;
      case 9: return this.formData.workoutDays.length > 1;
      default: return false;
    }
  }

  next() {
    if (this.canContinue()) {
      if (this.currentStep === 9) {
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

  nextStep() {
    this.currentStep = 1;
  }
  
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

  get age(): number {
    const currentYear = new Date().getFullYear();
    return this.birthYear ? (currentYear - this.birthYear) : 0;
  }

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

  selectGender(gender: Gender) {
    this.formData.gender = gender;
  }

  get selectedGender() {
    return this.formData.gender;
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

  maleBodyFatOptions: Bodyfat[] = [
    { label: 'Essential', range: '2-5%', value: 4, image: 'pages/onboarding/bodyfat/m-1.png' },
    { label: 'Athlete', range: '6-13%', value: 10, image: 'pages/onboarding/bodyfat/m-2.png' },
    { label: 'Fitness', range: '14-17%', value: 15, image: 'pages/onboarding/bodyfat/m-3.png' },
    { label: 'Average', range: '18-24%', value: 21, image: 'pages/onboarding/bodyfat/m-4.png' },
    { label: 'Obese', range: '25%+', value: 30, image: 'pages/onboarding/bodyfat/m-5.png' }
  ];

  femaleBodyFatOptions: Bodyfat[] = [
    { label: 'Essential', range: '10-13%', value: 12, image: 'pages/onboarding/bodyfat/f-1.png' },
    { label: 'Athlete', range: '14-20%', value: 17, image: 'pages/onboarding/bodyfat/f-2.png' },
    { label: 'Fitness', range: '21-24%', value: 22, image: 'pages/onboarding/bodyfat/f-3.png' },
    { label: 'Average', range: '25-31%', value: 28, image: 'pages/onboarding/bodyfat/f-4.png' },
    { label: 'Obese', range: '32%+', value: 35, image: 'pages/onboarding/bodyfat/f-5.png' }
  ];

  get currentBodyFatOptions(): Bodyfat[] {
    return this.formData.gender === 'female' ? this.femaleBodyFatOptions : this.maleBodyFatOptions;
  }

  workoutDuration: WorkoutDuration[] = [
    { duration: 30},
    { duration: 45},
    { duration: 60},
    { duration: 90}
  ];

  selectBodyFat(option: Bodyfat) {
    this.formData.bodyFat = option.value;
  }

  selectDuration(option: WorkoutDuration) {
    this.formData.workoutDuration = option.duration;
  }

  get selectedBodyFatInfo(): Bodyfat {
    const selected = this.currentBodyFatOptions.find(opt => opt.value === this.formData.bodyFat);
    return selected ? selected : { image: '', label: '-', range: '', value: 0 };
  }

  get selectedBodyFatLabel(): string {
    return this.selectedBodyFatInfo.label;
  }

  get bmiDisplay(): string {
    const h = this.formData.height;
    const w = this.formData.weight;
    if (h && w && h > 0) {
      const bmi = w / Math.pow(h / 100, 2);
      return bmi.toFixed(1);
    }
    return '0.0';
  } 

  sportsOptions: { id: Sport, label: string, icon: string }[] = [
    { id: 'badminton', label: 'Badminton', icon: '🏸' },
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'basketball', label: 'Basket', icon: '🏀' },
    { id: 'volley', label: 'Volley', icon: '🏐' },
    { id: 'swim', label: 'Swimming', icon: '🏊' }
  ];

  toggleSport(sport: Sport) {
    const idx = this.formData.sports.indexOf(sport);
    if (idx > -1) this.formData.sports.splice(idx, 1);
    else this.formData.sports.push(sport);
  }

  selectGoal(goal: Goal) {
    this.formData.goal = goal;
  }
  
  get selectedGoal() { return this.formData.goal; }

  selectDay(day: WorkoutDay) {
    const index = this.formData.workoutDays.indexOf(day);
    if (index > -1) this.formData.workoutDays.splice(index, 2);
    else this.formData.workoutDays.push(day);
  }

  get selectedDay() { return this.formData.workoutDays; }

  startLoadingProcess() {
    this.isLoading = true;
    this.loadingText = 'Menganalisa Kondisi Tubuh...';
    setTimeout(() => { this.loadingText = 'Menghitung Kebutuhan Kalori & BMI...'; }, 1500);
    setTimeout(() => { this.loadingText = 'Menyusun Jadwal Latihan Personal...'; }, 3000);
    setTimeout(() => { this.submit(); }, 4500);
  }

  submit() {
    if (this.birthYear && this.birthMonth && this.birthDay) {
      const y = this.birthYear.toString();
      const m = this.birthMonth.toString().padStart(2, '0');
      const d = this.birthDay.toString().padStart(2, '0');
      this.formData.birthDate = `${y}-${m}-${d}`;
    }
    console.log('FINAL PAYLOAD:', this.formData);
    this.router.navigate(['/suggestion-result']);
  }
}