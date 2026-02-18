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
  isAllCompleted: boolean = false; // <-- Variabel baru

  constructor(
    private historyService: WorkoutHistoryService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.currentUserId = user?.id || 0;
    this.initScheduleData();
  }

  initScheduleData() {
    const mlData = localStorage.getItem('ml_data_ready'); 
    if (mlData) {
      this.readyData = JSON.parse(mlData);
      const daysString = this.readyData.userProfile?.workoutDays || "";
      this.userWorkoutDays = daysString.split(',').map((d: string) => d.trim()).filter((d: string) => d !== "");
      this.syncAndLoad();
    }
  }

  syncAndLoad() {
    this.activities = [];
    this.isAllCompleted = false; // Reset state
    const envKey = this.selectedMode.toLowerCase(); 
    const workoutPlanMap = this.readyData.workoutRecommendation?.[envKey]?.workoutPlan || 
                           this.readyData.workoutRecommendation?.[envKey]?.workout_plan || {};
    
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sortedDays = this.userWorkoutDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    const dayPosition = sortedDays.indexOf(todayShort);

    // 1. Cek jika tidak ada jadwal (Rest Day)
    if (dayPosition === -1) {
      this.currentDailyPlan = [];
      this.isRestDay = true;
      return;
    }

    this.isRestDay = false;
    const targetDayNum = dayPosition + 1; 
    const dayKey = Object.keys(workoutPlanMap).find(k => k.toLowerCase().includes(`day ${targetDayNum}`));

    if (dayKey && workoutPlanMap[dayKey]) {
      this.currentDailyPlan = workoutPlanMap[dayKey]; 

      this.historyService.getHistory(this.currentUserId).subscribe({
        next: (dbHistory) => {
            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            
            const todayDbData = dbHistory.filter(h => 
                h.updatedAt.toString().startsWith(todayStr) && 
                h.environment === this.selectedMode
            );

            this.mapPlanToUI(todayDbData);
        },
        error: () => this.mapPlanToUI([])
      });
    } else {
        this.activities = [];
        this.isRestDay = true;
    }
  }

  mapPlanToUI(dbData: any[]) {
    if (!this.currentDailyPlan || this.currentDailyPlan.length === 0) return;

    const mappedData = this.currentDailyPlan.map(planItem => {
        const itemName = planItem.exerciseName || planItem.exercise_name;
        const dbRecord = dbData.find(h => h.title.toLowerCase().trim() === itemName.toLowerCase().trim());

        if (dbRecord && dbRecord.status === 'FINISHED') return null; 

        const duration = Number(planItem.durationMinutes || planItem.duration_minutes) || 0;
        const restTotal = Number(planItem.restMinutes || planItem.rest_minutes) || 0;
        const sets = Number(planItem.sets) || 1;

        return {
            id: dbRecord ? dbRecord.id : null,
            exerciseId: planItem.realId, 
            title: itemName,
            description: planItem.instructions || "Lakukan gerakan ini dengan benar.",
            tag: planItem.muscleGroup || planItem.muscle_group || "General",
            sets: sets,
            reps: planItem.reps,
            calories: planItem.caloriesBurned || planItem.calories_burned,
            timePerSet: `${duration} min`, 
            rest: sets > 0 ? Math.round(restTotal / sets) : 0, 
            totalTime: `${duration + restTotal} Min`, 
            imageUrl: planItem.imageUrl || 'assets/images/placeholder_exercise.png',
            environment: this.selectedMode
        };
    });

    this.activities = mappedData.filter(item => item !== null);

    // --- LOGIKA BARU: Jika jadwal ada tapi list kosong, berarti sudah dikerjakan semua ---
    if (this.activities.length === 0) {
        this.isAllCompleted = true;
    } else {
        this.isAllCompleted = false;
    }
  }

  toggleActivityStatus(index: number) {
    const activity = this.activities[index];
    const payload = {
      id: activity.id,
      userId: this.currentUserId,
      title: activity.title,
      status: 'FINISHED',
      calories: `${activity.calories} cal`,
      totalTime: activity.totalTime, 
      sets: activity.sets,
      reps: activity.reps,
      environment: activity.environment
    };

    this.historyService.saveHistory(payload).subscribe({
      next: () => { 
          this.activities.splice(index, 1);
          // Cek lagi: Kalau setelah dihapus jadi kosong, tampilkan pesan complete
          if (this.activities.length === 0) {
              this.isAllCompleted = true;
          }
      }
    });
  }

  // UI Helpers
  goToActivity(index: number) {
    if (this.activities[index]?.exerciseId) {
      this.router.navigate(['/dashboard/workout-detail', this.activities[index].exerciseId]);
    }
  }
  toggleMode() { this.isModeOpen = !this.isModeOpen; }
  setMode(mode: 'Home' | 'Gym') {
    this.selectedMode = mode;
    this.isModeOpen = false;
    this.syncAndLoad(); 
  }
}