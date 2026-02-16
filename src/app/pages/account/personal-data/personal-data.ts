import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environment/environment';

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

  // Struktur Data User
  userData: any = {
    gender: 'male',
    weight: 0,
    height: 0,
    dob: '',
    workoutDuration: 60, // Default 60 menit
    workoutDays: [] as string[],
    hobbies: [] as string[], // Array untuk menampung Sport yang dipilih (UI)
    goal: 'Muscle Gain',
    level: 'Beginner',
    bodyFatPercentage: 15,
    bodyFatCategory: 3
  };

  // Opsi Body Fat (Sesuaikan image path dengan projectmu)
  bodyFatLevels = [
    { value: 4, label: 'Essential', range: '2-5%', image: 'assets/bodyfat/essential.png' },
    { value: 10, label: 'Athlete', range: '6-13%', image: 'assets/bodyfat/athlete.png' },
    { value: 15, label: 'Fitness', range: '14-17%', image: 'assets/bodyfat/fitness.png' },
    { value: 21, label: 'Average', range: '18-24%', image: 'assets/bodyfat/average.png' },
    { value: 30, label: 'Obese', range: '25%+', image: 'assets/bodyfat/obese.png' }
  ];

  // Opsi Durasi (Sesuai HTML baru kamu)
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

  loadUserData() {
    const user = this.authService.getUser();
  
    if (user) {
      this.userName = user.fullname ? user.fullname.split(' ')[0] : user.username;
      
      if (user.userProfileDTO) {
        const p = user.userProfileDTO;
        
        // 1. Mapping Sport dari Database (1/0) ke Array string (UI)
        const loadedHobbies = [];
        if (p.badminton) loadedHobbies.push('Badminton');
        if (p.football) loadedHobbies.push('Football');
        if (p.volleyball) loadedHobbies.push('Volley'); // Nama harus sama persis dgn HTML
        if (p.swim) loadedHobbies.push('Swimming');     // Nama harus sama persis dgn HTML
        if (p.basketball) loadedHobbies.push('Basket'); // Nama harus sama persis dgn HTML

        this.userData = {
          gender: p.gender?.toLowerCase() || 'male',
          weight: p.weight || 0,
          height: p.height || 0,
          dob: p.dob ? p.dob.split('T')[0] : '',
          workoutDuration: p.duration || 60, // Load durasi
          goal: p.goal || 'Muscle Gain',
          level: p.level || 'Beginner',
          bodyFatPercentage: p.bodyFatPercentage || 15,
          bodyFatCategory: p.bodyFatCategory || 3,
          hobbies: loadedHobbies, // Masukkan ke state UI
          workoutDays: p.workoutDays 
            ? p.workoutDays.split(',').map((d: string) => d.trim()).filter((d: string) => d !== "") 
            : []
        };
      }
    }
  }

  // --- Logic Gender ---
  selectGender(gender: string) { this.userData.gender = gender; }
  
  // --- Logic Body Fat ---
  getBodyFatImage(path: string) { return path; }

  selectBodyFat(level: any) {
    this.userData.bodyFatCategory = 0; 
    this.userData.bodyFatPercentage = level.value;
    // Helper property untuk UI highlight
    this.userData.bodyFat = level.value; 
  }

  // --- Logic Duration (HTML Baru) ---
  selectDuration(min: number) { 
    this.userData.workoutDuration = min; 
  }

  // --- Logic Workout Days ---
  toggleDay(day: string) {
    const idx = this.userData.workoutDays.indexOf(day);
    if (idx > -1) this.userData.workoutDays.splice(idx, 1);
    else this.userData.workoutDays.push(day);
  }
  isDaySelected(day: string): boolean { return this.userData.workoutDays.includes(day); }

  // --- Logic Sport (Yang sebelumnya kurang) ---
  toggleSport(sport: string) {
    const idx = this.userData.hobbies.indexOf(sport);
    if (idx > -1) {
      this.userData.hobbies.splice(idx, 1); // Hapus (Toggle Off)
    } else {
      this.userData.hobbies.push(sport); // Tambah (Toggle On)
    }
  }

  // --- Save Data ---
  saveChanges() {
    this.isLoading = true;

    // 2. Mapping Sport dari Array string (UI) ke Database (1/0)
    const sportFlags = {
      badminton: this.userData.hobbies.includes('Badminton') ? 1 : 0,
      football: this.userData.hobbies.includes('Football') ? 1 : 0,
      volleyball: this.userData.hobbies.includes('Volley') ? 1 : 0,
      swim: this.userData.hobbies.includes('Swimming') ? 1 : 0,
      basketball: this.userData.hobbies.includes('Basket') ? 1 : 0,
    };

    // Susun Payload
    const payload = { 
      ...this.userData,
      ...sportFlags, // Spread flag sport 1/0
      duration: this.userData.workoutDuration, // Kirim durasi
      workoutDays: this.userData.workoutDays.join(','), // Array hari jadi string "Mon,Tue"
      frequency: this.userData.workoutDays.length 
    };

    // Bersihkan properti UI helper agar payload bersih
    delete payload.hobbies;
    delete payload.bodyFat; 
    
    this.http.put(`${environment.apiUrl}profile/update`, payload).subscribe({
      next: (res: any) => {
        // Update Local Storage User
        const currentUser = this.authService.getUser();
        if (currentUser) {
            currentUser.userProfileDTO = { ...currentUser.userProfileDTO, ...payload };
            // Update service dan local storage
            this.authService.updateUserOnly(currentUser); 
        }

        // Hapus cache ML agar dashboard hitung ulang
        localStorage.removeItem('ml_result'); 

        this.triggerToast('Data updated! AI is recalculating...', 'success');
        this.isLoading = false;
        this.updateRecommendation();
        
        // Opsional: Reload data agar UI sinkron penuh
        this.loadUserData(); 
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

  updateRecommendation() { 
    this.router.navigate(['/dashboard']); 
  }
}