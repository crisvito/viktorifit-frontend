import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService, ExerciseService } from '../../../core'; // Tambahkan ExerciseService

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalendarComponent, RouterLink], 
  templateUrl: './schedule.html',
})
export class Schedule implements OnInit {

  isModeOpen = false;
  selectedMode: 'Home' | 'Gym' = 'Home';
  currentDate: Date = new Date(); 
  rawMLResult: any = null;
  currentDayKey: string | null = null; 
  userWorkoutDays: string[] = [];
  activities: any[] = [];
  private currentUserId: number = 1;

  // Variabel untuk menyimpan "Kamus" latihan
  private masterExercises: any[] = [];

  constructor(
    private historyService: WorkoutHistoryService,
    private exerciseService: ExerciseService // Inject Service
  ) {}

  ngOnInit() {
    // 1. Load Master Data Exercise Dulu
    this.exerciseService.getAllExercises().subscribe({
      next: (exercises) => {
        this.masterExercises = exercises;
        
        // 2. Setelah master data siap, baru jalankan logic schedule
        this.initScheduleData();
      },
      error: (err) => {
        console.error('Gagal load master exercise', err);
        // Tetap jalan meski tanpa gambar
        this.initScheduleData();
      }
    });
  }

  // Logic init dipisah biar rapi
  initScheduleData() {
    const mlData = localStorage.getItem('ml_result');
    if (mlData) {
      this.rawMLResult = JSON.parse(mlData);
      const daysString = this.rawMLResult.userProfile?.workoutDays || "";
      this.userWorkoutDays = daysString.split(',').map((d: string) => d.trim());
      this.syncWithBackend();
    }
  }

  syncWithBackend() {
    const envKey = this.selectedMode.toLowerCase(); 
    const workoutPlan = this.rawMLResult.workoutRecommendation?.[envKey]?.workout_plan || {};
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const dayIndex = this.userWorkoutDays.indexOf(todayShort);

    if (dayIndex === -1) {
      this.activities = [];
      return;
    }

    const targetDayNum = dayIndex + 1;
    const allKeys = Object.keys(workoutPlan);
    this.currentDayKey = allKeys.find(k => k.toLowerCase().includes(`day ${targetDayNum}`)) || null;

    if (this.currentDayKey && workoutPlan[this.currentDayKey]) {
      const dailyPlan = workoutPlan[this.currentDayKey];

      this.historyService.getHistory(this.currentUserId).subscribe(dbHistory => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const todayDbData = dbHistory.filter(h => 
          h.updatedAt.toString().startsWith(todayStr) && 
          h.environment === this.selectedMode
        );

        dailyPlan.forEach((ex: any) => {
          // Pencocokan nama harus hati-hati (trim & lowercase)
          const isAlreadyInDb = todayDbData.find(h => 
            h.title.toLowerCase().trim() === ex.exercise_name.toLowerCase().trim()
          );

          if (!isAlreadyInDb) {
            const payload = {
              userId: this.currentUserId,
              title: ex.exercise_name,
              status: 'PENDING',
              calories: `${ex.calories_burned} cal`,
              totalTime: `${ex.duration_minutes + ex.rest_minutes} Min`,
              sets: ex.sets,
              reps: ex.reps,
              environment: this.selectedMode
            };
            this.historyService.saveHistory(payload).subscribe();
          }
        });

        // Load data terbaru untuk ditampilkan
        this.loadActivitiesFromDB();
      });
    }
  }

  loadActivitiesFromDB() {
    this.historyService.getHistory(this.currentUserId).subscribe(data => {
      const todayStr = new Date().toISOString().split('T')[0];
      
      this.activities = data
        .filter(h => 
          h.status === 'PENDING' && 
          h.updatedAt.toString().startsWith(todayStr) && 
          h.environment === this.selectedMode
        )
        .map(h => {
          // --- LOGIC MENCARI EXERCISE ID ---
          // Cari latihan di masterExercises yang namanya sama dengan history title
          const matchedExercise = this.masterExercises.find(m => 
            m.name.toLowerCase().trim() === h.title.toLowerCase().trim()
          );

          // Ambil ID Exercise (bukan ID History)
          // Jika ketemu pakai ID master, jika tidak null/string kosong
          const exerciseId = matchedExercise ? matchedExercise.id : null;
          
          return {
            id: h.id,          // Ini HISTORY ID (untuk update status)
            exerciseId: exerciseId, // Ini EXERCISE ID (untuk gambar/routerLink)
            title: h.title,
            calories: h.calories,
            totalTime: h.totalTime,
            sets: h.sets,
            reps: h.reps,
            environment: h.environment,
            isFinished: false,
            // Bonus: Langsung generate URL Image disini biar di HTML bersih
            imageUrl: exerciseId 
              ? `https://res.cloudinary.com/dmhzqtzrr/image/upload/${exerciseId}.gif`
              : 'assets/images/placeholder_exercise.png'
          };
        });
    });
  }

  toggleActivityStatus(index: number) {
    const activity = this.activities[index];

    // Payload update hanya butuh data history asli
    const payload = {
      id: activity.id,     // History ID
      userId: this.currentUserId,
      title: activity.title,
      status: 'FINISHED',
      calories: activity.calories,
      totalTime: activity.totalTime,
      sets: activity.sets,
      reps: activity.reps,
      environment: activity.environment
    };

    this.historyService.saveHistory(payload).subscribe({
      next: () => {
        this.activities.splice(index, 1);
      }
    });
  }

  toggleMode() { this.isModeOpen = !this.isModeOpen; }
  
  setMode(mode: 'Home' | 'Gym') {
    this.selectedMode = mode;
    this.isModeOpen = false;
    this.syncWithBackend();
  }
}