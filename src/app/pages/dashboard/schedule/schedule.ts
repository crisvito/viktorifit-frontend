import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService, ExerciseService } from '../../../core'; // Import Service

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

  // 1. Variable untuk menyimpan "Kamus" latihan (Image & ID)
  private masterExercises: any[] = [];
  
  // 2. Variable untuk menyimpan Rencana Asli ML hari ini (Duration & Rest)
  private currentDailyPlan: any[] = []; 

  constructor(
    private historyService: WorkoutHistoryService,
    private exerciseService: ExerciseService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load Master Data Exercise Dulu
    this.exerciseService.getAllExercises().subscribe({
      next: (exercises) => {
        this.masterExercises = exercises;
        
        // Setelah master data siap, baru jalankan logic schedule
        this.initScheduleData();
      },
      error: (err) => {
        console.error('Gagal load master exercise', err);
        // Tetap jalan meski tanpa gambar
        this.initScheduleData();
      }
    });
  }

  goToActivity(index: number) {
    const activity = this.activities[index];
    
    // Pastikan kita punya exerciseId (ID Master Latihan)
    if (activity && activity.exerciseId) {
      this.router.navigate(['/dashboard/workout-detail', activity.exerciseId]);
    } else {
      console.warn('Exercise ID tidak ditemukan, tidak bisa melihat detail.');
    }
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
      this.currentDailyPlan = []; // Reset plan jika libur
      return;
    }

    const targetDayNum = dayIndex + 1;
    const allKeys = Object.keys(workoutPlan);
    this.currentDayKey = allKeys.find(k => k.toLowerCase().includes(`day ${targetDayNum}`)) || null;

    if (this.currentDayKey && workoutPlan[this.currentDayKey]) {
      // 3. SIMPAN PLAN ASLI KE VARIABLE GLOBAL CLASS
      // Ini penting agar loadActivitiesFromDB bisa mengakses data duration/rest asli
      this.currentDailyPlan = workoutPlan[this.currentDayKey];

      this.historyService.getHistory(this.currentUserId).subscribe(dbHistory => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const todayDbData = dbHistory.filter(h => 
          h.updatedAt.toString().startsWith(todayStr) && 
          h.environment === this.selectedMode
        );

        this.currentDailyPlan.forEach((ex: any) => {
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
              totalTime: `${ex.duration_minutes + ex.rest_minutes} Min`, // Simpan total string ke DB
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
          // A. LOGIC MENCARI EXERCISE ID (Untuk Gambar)
          const matchedExercise = this.masterExercises.find(m => 
            m.name.toLowerCase().trim() === h.title.toLowerCase().trim()
          );

          // B. LOGIC MENCARI DATA ASLI ML (Untuk Duration & Rest)
          // Kita cari object asli dari local storage yang namanya sama dengan history DB
          const originalMLData = this.currentDailyPlan.find(ml => 
             ml.exercise_name.toLowerCase().trim() === h.title.toLowerCase().trim()
          );

          // Ambil detail durasi & istirahat (Fallback ke 0 jika tidak ketemu)
          const durationVal = originalMLData ? originalMLData.duration_minutes : 0;
          const restVal = originalMLData ? originalMLData.rest_minutes : 0;

          const exerciseId = matchedExercise ? matchedExercise.id : null;
          
          return {
            id: h.id,          // ID History
            exerciseId: exerciseId, // ID Exercise (Gambar)
            
            title: h.title,
            calories: h.calories,
            
            // Masukkan data terpisah agar bisa dipakai di HTML {{ item.duration }}
            duration: durationVal,
            rest: restVal,
            
            sets: h.sets,
            reps: h.reps,
            environment: h.environment,
            isFinished: false,
            
            imageUrl: exerciseId 
              ? `https://res.cloudinary.com/dmhzqtzrr/image/upload/${exerciseId}.gif`
              : 'assets/images/placeholder_exercise.png'
          };
        });
    });
  }

  toggleActivityStatus(index: number) {
    const activity = this.activities[index];

    // Payload update ke database tetap pakai struktur DB
    const payload = {
      id: activity.id,     // History ID
      userId: this.currentUserId,
      title: activity.title,
      status: 'FINISHED',
      calories: activity.calories,
      // Total time string tetap kita kirim untuk konsistensi DB
      totalTime: `${activity.duration + activity.rest} Min`, 
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