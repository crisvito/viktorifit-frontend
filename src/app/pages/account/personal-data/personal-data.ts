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
    isHypertension: false,
    isDiabetes: false,
    workoutDuration: 0,
    workoutDays: []
  };

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    console.log('Mengambil data dari Database...');
    
    setTimeout(() => {
      this.userData = {
        gender: 'female',
        weight: 55,
        height: 165,
        isHypertension: false,
        isDiabetes: true,
        workoutDuration: 45,
        workoutDays: ['Monday', 'Wednesday', 'Friday']
      };
    }, 500);
  }

  selectGender(gender: string) {
    this.userData.gender = gender;
  }

  saveChanges() {
    console.log('Data yang akan disimpan ke DB:', this.userData);
    alert('Personal Data Updated!');
  }

  toggleHypertension() {
    this.userData.isHypertension = !this.userData.isHypertension;
  }

  toggleDiabetes() {
    this.userData.isDiabetes = !this.userData.isDiabetes;
  }

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  toggleDay(day: string) {
    const index = this.userData.workoutDays.indexOf(day);
    
    if (index > -1) {
      this.userData.workoutDays.splice(index, 1);
    } else {
      this.userData.workoutDays.push(day);
    }
  }

  isDaySelected(day: string): boolean {
    return this.userData.workoutDays.includes(day);
  }

  updateRecommendation() {
    console.log('Menyimpan ke Database DAN Trigger Update ML...', this.userData);
    alert('Data Saved & Recommendation Updated!');
  }
}