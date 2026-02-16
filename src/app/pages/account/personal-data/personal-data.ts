import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personal-data.html',
  styleUrl: './personal-data.css'
})
export class PersonalData implements OnInit {
  
  userData: any = {
    gender: 'male',
    weight: 0,
    height: 0,
    bodyFat: 0,          // Menyimpan 'value' (contoh: 15)
    bodyFatCategory: '', // Menyimpan 'label' (contoh: 'Average')
    workoutDuration: 0,
    hobbies: [],
    goal: '',
    workoutDays: []
  };

  // Data Body Fat Levels (Sesuai request)
  bodyFatLevels = [
    { label: 'Very Lean', range: '<10%', value: 4, image: 'global/body-fat/male_veryLean.svg' },
    { label: 'Athlete', range: '10-18%', value: 10, image: 'global/body-fat/male_athletic.svg' },
    { label: 'Average', range: '18-24%', value: 15, image: 'global/body-fat/male_average.svg' },
    { label: 'Overweight', range: '24-30%', value: 21, image: 'global/body-fat/male_overweight.svg' },
    { label: 'Obese', range: '>30%', value: 30, image: 'global/body-fat/male_obese.svg' }
  ];

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    // Mock Data
    setTimeout(() => {
      this.userData = {
        gender: 'male',
        weight: 70,
        height: 175,
        bodyFat: 15, // Default ke 'Average'
        bodyFatCategory: 'Average',
        workoutDuration: 45,
        hobbies: ['Football'],
        goal: 'Muscle Gain',
        workoutDays: ['Tuesday', 'Thursday']
      };
    }, 500);
  }

  selectGender(gender: string) {
    this.userData.gender = gender;
    // Opsional: Reset body fat selection saat ganti gender jika standar persen beda
    // tapi untuk UI visual, dibiarkan saja juga oke.
  }

  // --- Logic Baru untuk Body Fat ---
  selectBodyFat(level: any) {
    this.userData.bodyFat = level.value;
    this.userData.bodyFatCategory = level.label;
  }

  // Helper untuk switch gambar cowok/cewek secara otomatis
  getBodyFatImage(originalPath: string): string {
    if (this.userData.gender === 'female') {
      // Mengganti string 'male' di path menjadi 'female'
      // Pastikan aset gambar kamu bernama: female_veryLean.svg, female_athletic.svg, dst.
      return originalPath.replace('male', 'female');
    }
    return originalPath;
  }

  // --- Logic Lainnya (Habit & Plan) ---
  toggleSport(sport: string) {
    if (!this.userData.hobbies) this.userData.hobbies = [];
    const index = this.userData.hobbies.indexOf(sport);
    if (index > -1) this.userData.hobbies.splice(index, 1);
    else this.userData.hobbies.push(sport);
  }

  toggleDay(day: string) {
    const index = this.userData.workoutDays.indexOf(day);
    if (index > -1) this.userData.workoutDays.splice(index, 1);
    else this.userData.workoutDays.push(day);
  }

  isDaySelected(day: string): boolean {
    return this.userData.workoutDays.includes(day);
  }

  saveChanges() {
    console.log('Saved:', this.userData);
    alert('Data Updated!');
  }
  
  updateRecommendation() {
    alert('Recommendation Updated!');
  }
}