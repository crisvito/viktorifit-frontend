import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService, AuthService } from '../../../core'; 

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalendarComponent, RouterLink], 
  templateUrl: './schedule.html',
})
export class Schedule implements OnInit {

  // UI State
  isModeOpen = false;
  selectedMode: 'Home' | 'Gym' = 'Home';
  currentDate: Date = new Date(); 
  
  // Data
  private readyData: any = null;
  private currentDailyPlan: any[] = []; 
  private currentUserId: number = 0; 
  
  // Public Variables
  userWorkoutDays: string[] = [];
  activities: any[] = [];
  isRestDay: boolean = false;

  constructor(
    private historyService: WorkoutHistoryService,
    private authService: AuthService, // Inject Auth Service
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.currentUserId = user?.id || 0;
    this.initScheduleData();
  }

  initScheduleData() {
    // 1. Ambil data MATANG dari LocalStorage
    const mlData = localStorage.getItem('ml_data_ready'); 
    
    if (mlData) {
      this.readyData = JSON.parse(mlData);
      // Ambil hari dari profile (jika ada)
      const daysString = this.readyData.userProfile?.workoutDays || "";
      this.userWorkoutDays = daysString.split(',').map((d: string) => d.trim()).filter((d: string) => d !== "");
      
      this.syncAndLoad();
    }
  }

  syncAndLoad() {
    this.activities = []; // Reset dulu biar bersih
    const envKey = this.selectedMode.toLowerCase(); 
    
    // Support CamelCase (DB) & SnakeCase (ML)
    const workoutPlanMap = this.readyData.workoutRecommendation?.[envKey]?.workoutPlan || 
                           this.readyData.workoutRecommendation?.[envKey]?.workout_plan || {};
    
    // 1. Cek Hari Ini
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    
    // --- LOGIKA HARI WORKOUT (Fixed Sequence) ---
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    
    // Urutkan hari pilihan user sesuai kalender (Mon, Tue, Wed...)
    const sortedDays = this.userWorkoutDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    // Cari posisi hari ini di dalam jadwal yang sudah urut
    const dayPosition = sortedDays.indexOf(todayShort);

    // 2. Jika hari ini BUKAN jadwal latihan (Rest Day)
    if (dayPosition === -1) {
      this.currentDailyPlan = [];
      this.isRestDay = true;
      return;
    }

    this.isRestDay = false;
    const targetDayNum = dayPosition + 1; // Index 0 -> Day 1
    
    // 3. Cari Key yang cocok (misal "Day 1")
    const dayKey = Object.keys(workoutPlanMap).find(k => k.toLowerCase().includes(`day ${targetDayNum}`));

    if (dayKey && workoutPlanMap[dayKey]) {
      // INI BLUEPRINT UTAMA KITA
      this.currentDailyPlan = workoutPlanMap[dayKey]; 

      // 4. Ambil Status dari Database (History)
      this.historyService.getHistory(this.currentUserId).subscribe({
        next: (dbHistory) => {
            const todayStr = new Date().toISOString().split('T')[0];
            
            // Filter DB hanya untuk hari ini & mode ini
            const todayDbData = dbHistory.filter(h => 
                h.updatedAt.toString().startsWith(todayStr) && 
                h.environment === this.selectedMode
            );

            // Jalankan Mapping
            this.mapPlanToUI(todayDbData);
        },
        error: (err) => {
            console.error("DB Error, showing local plan", err);
            this.mapPlanToUI([]); 
        }
      });
    } else {
        // Kasus aneh: Hari latihan tapi data plan tidak ketemu
        this.activities = [];
        this.isRestDay = true;
    }
  }

  // --- LOGIC UTAMA: MERGE PLAN + DB ---
  mapPlanToUI(dbData: any[]) {
    if (!this.currentDailyPlan || this.currentDailyPlan.length === 0) return;

    this.activities = this.currentDailyPlan.map(planItem => {
        // Support name Camel & Snake
        const itemName = planItem.exerciseName || planItem.exercise_name;
        
        // 1. Cek apakah item ini ada di DB? (Match by Name)
        const dbRecord = dbData.find(h => 
            h.title.toLowerCase().trim() === itemName.toLowerCase().trim()
        );

        // 2. Hitung Angka (Duration, Rest, Sets)
        const duration = Number(planItem.durationMinutes || planItem.duration_minutes) || 0;
        const restTotal = Number(planItem.restMinutes || planItem.rest_minutes) || 0;
        const sets = Number(planItem.sets) || 1;
        const restPerSet = sets > 0 ? Math.round(restTotal / sets) : 0;
        const totalTimeVal = duration + restTotal;

        // 3. Tentukan Status & ID
        const isFinished = dbRecord ? dbRecord.status === 'FINISHED' : false;
        const dbId = dbRecord ? dbRecord.id : null;

        return {
            id: dbId, // Null jika belum tersimpan di DB
            exerciseId: planItem.realId, // ID Master (untuk link detail)
            
            title: itemName,
            description: planItem.instructions || "Lakukan gerakan ini dengan benar.",
            tag: planItem.muscleGroup || planItem.muscle_group || "General",
            
            // Data Angka
            sets: sets,
            reps: planItem.reps,
            calories: planItem.caloriesBurned || planItem.calories_burned,
            
            // Data Waktu (Display)
            timePerSet: `${duration} min`, 
            rest: restPerSet, 
            totalTime: `${totalTimeVal} Min`, 
            
            // Gambar (Fallback jika null)
            imageUrl: planItem.imageUrl || 'assets/images/placeholder_exercise.png',
            
            isFinished: isFinished,
            environment: this.selectedMode
        };
    });

    // Sort: Pending di atas, Finished di bawah
    this.activities.sort((a, b) => (a.isFinished === b.isFinished) ? 0 : a.isFinished ? 1 : -1);
  }

  toggleActivityStatus(index: number) {
    const activity = this.activities[index];
    const newStatus = activity.isFinished ? 'PENDING' : 'FINISHED';
    
    // Payload Simpan/Update
    const payload = {
      id: activity.id, // Jika null, backend akan Create Baru. Jika ada, Update.
      userId: this.currentUserId,
      title: activity.title,
      status: newStatus,
      calories: `${activity.calories} cal`,
      totalTime: activity.totalTime, 
      sets: activity.sets,
      reps: activity.reps,
      environment: activity.environment
    };

    this.historyService.saveHistory(payload).subscribe({
      next: (savedRecord: any) => { 
          // Update data lokal agar responsif
          activity.isFinished = !activity.isFinished;
          
          // PENTING: Simpan ID baru jika ini create pertama kali
          if (!activity.id && savedRecord && savedRecord.id) {
              activity.id = savedRecord.id;
          }

          // Sort ulang
          this.activities.sort((a, b) => (a.isFinished === b.isFinished) ? 0 : a.isFinished ? 1 : -1);
      }
    });
  }

  goToActivity(index: number) {
    const activity = this.activities[index];
    if (activity && activity.exerciseId) {
      this.router.navigate(['/dashboard/workout-detail', activity.exerciseId]);
    }
  }

  toggleMode() { this.isModeOpen = !this.isModeOpen; }
  
  setMode(mode: 'Home' | 'Gym') {
    this.selectedMode = mode;
    this.isModeOpen = false;
    this.syncAndLoad(); 
  }
}