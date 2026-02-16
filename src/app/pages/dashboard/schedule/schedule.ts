import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService } from '../../../core';

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

  constructor(private historyService: WorkoutHistoryService) {}

  ngOnInit() {
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
          const isAlreadyInDb = todayDbData.find(h => h.title === ex.exercise_name);

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
        .map(h => ({
          id: h.id,
          title: h.title,
          calories: h.calories,
          totalTime: h.totalTime,
          sets: h.sets,
          reps: h.reps,
          environment: h.environment,
          isFinished: false 
        }));
    });
  }

  toggleActivityStatus(index: number) {
    const activity = this.activities[index];

    const payload = {
      ...activity,
      userId: this.currentUserId,
      status: 'FINISHED'
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