import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environment/environment';

interface Bodyfat {
  label: string;
  range: string;
  value: number;
  category: number;
  image: string;
}

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-data.html',
})
export class PersonalData implements OnInit {
  isLoading = false;
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  userName: string = '';

  userData: any = {
    gender: 'male',
    weight: 0,
    height: 0,
    dob: '',
    workoutDuration: 60,
    workoutDays: [] as string[],
    hobbies: [] as string[],
    goal: 'Muscle Gain',
    level: 'Beginner',
    bodyFatPercentage: 15,
    bodyFatCategory: 3,
    bodyFat: 15 
  };

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

  durationOptions = [30, 45, 60, 90];
  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  get bodyFatLevels(): Bodyfat[] {
    return this.userData.gender === 'female' ? this.femaleBodyFatOptions : this.maleBodyFatOptions;
  }

  loadUserData() {
    const user = this.authService.getUser();
    if (user && user.userProfileDTO) {
      const p = user.userProfileDTO;
      this.userName = user.fullname ? user.fullname.split(' ')[0] : user.username;

      const loadedHobbies = [];
      if (p.badminton) loadedHobbies.push('Badminton');
      if (p.football) loadedHobbies.push('Football');
      if (p.volleyball) loadedHobbies.push('Volley');
      if (p.swim) loadedHobbies.push('Swimming');
      if (p.basketball) loadedHobbies.push('Basket');

      this.userData = {
        gender: p.gender?.toLowerCase() || 'male',
        weight: p.weight || 0,
        height: p.height || 0,
        dob: p.dob ? p.dob.split('T')[0] : '',
        workoutDuration: p.duration || 60,
        goal: p.goal || 'Muscle Gain',
        level: p.level || 'Beginner',
        bodyFatPercentage: p.bodyFatPercentage || 15,
        bodyFatCategory: p.bodyFatCategory || 3,
        hobbies: loadedHobbies,
        workoutDays: p.workoutDays
          ? p.workoutDays.split(',').map((d: string) => d.trim()).filter((d: string) => d !== "")
          : []
      };

      const currentOptions = this.bodyFatLevels;
      const match = currentOptions.find(o => o.category === this.userData.bodyFatCategory);
      this.userData.bodyFat = match ? match.value : this.userData.bodyFatPercentage;
    }
  }

  selectGender(gender: string) {
    if (this.userData.gender !== gender) {
      this.userData.gender = gender;
      const newOptions = this.bodyFatLevels;
      const match = newOptions.find(o => o.category === this.userData.bodyFatCategory);
      if (match) {
        this.userData.bodyFat = match.value;
        this.userData.bodyFatPercentage = match.value;
      }
    }
  }

  selectBodyFat(level: Bodyfat) {
    this.userData.bodyFat = level.value;
    this.userData.bodyFatPercentage = level.value;
    this.userData.bodyFatCategory = level.category;
  }

  selectDuration(min: number) { this.userData.workoutDuration = min; }

  toggleDay(day: string) {
    const idx = this.userData.workoutDays.indexOf(day);
    if (idx > -1) this.userData.workoutDays.splice(idx, 1);
    else this.userData.workoutDays.push(day);
  }

  isDaySelected(day: string): boolean { return this.userData.workoutDays.includes(day); }

  toggleSport(sport: string) {
    const idx = this.userData.hobbies.indexOf(sport);
    if (idx > -1) this.userData.hobbies.splice(idx, 1);
    else this.userData.hobbies.push(sport);
  }

  saveChanges() {
    this.isLoading = true;

    const sportFlags = {
      badminton: this.userData.hobbies.includes('Badminton') ? 1 : 0,
      football: this.userData.hobbies.includes('Football') ? 1 : 0,
      volleyball: this.userData.hobbies.includes('Volley') ? 1 : 0,
      swim: this.userData.hobbies.includes('Swimming') ? 1 : 0,
      basketball: this.userData.hobbies.includes('Basket') ? 1 : 0,
    };

    const payload = {
      ...this.userData,
      ...sportFlags,
      duration: this.userData.workoutDuration,
      workoutDays: this.userData.workoutDays.join(','),
      frequency: this.userData.workoutDays.length
    };

    const cleanPayload = { ...payload };
    delete cleanPayload.hobbies;
    delete cleanPayload.bodyFat;

    this.http.put(`${environment.apiUrl}profile/update`, cleanPayload).subscribe({
      next: (res: any) => {
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.userProfileDTO = { ...currentUser.userProfileDTO, ...cleanPayload };
          this.authService.updateUserOnly(currentUser);
        }

        // --- PENTING: HAPUS CACHE AGAR DASHBOARD TAU ADA UPDATE ---
        localStorage.removeItem('ml_result');
        localStorage.removeItem('ml_data_ready');

        this.triggerToast('Profile updated! Recalculating...', 'success');
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.triggerToast('Update failed!', 'error');
        this.isLoading = false;
      }
    });
  }

  triggerToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}