import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService } from '../../../core';
@
Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './history.html',
})
export class History implements OnInit {
  isPeriodModalOpen = false;
  selectedMonth: Date = new Date();
  tempMonthIndex: number = new Date().getMonth();
  tempYear: number = new Date().getFullYear();
  
  monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  yearsList = [2024, 2025, 2026];
  
  activityGroups: any[] = [];
  selectedMode: 'Home' | 'Gym' = 'Home';

  // Anggap saja ID User yang login adalah 1
  private currentUserId: number = 1;

  constructor(
    private router: Router,
    private historyService: WorkoutHistoryService // Inject Service Backend
  ) {}

  ngOnInit() { 
    this.loadHistoryData(); 
  }

  loadHistoryData() {
    // 1. Ambil data dari Backend
    this.historyService.getHistory(this.currentUserId).subscribe({
      next: (data) => {
        // 2. Filter hanya yang statusnya FINISHED dan sesuai Periode
        const filtered = data.filter((item: any) => {
          const date = new Date(item.updatedAt); // Pakai updatedAt dari database
          return item.status === 'FINISHED' && 
                 date.getMonth() === this.selectedMonth.getMonth() && 
                 date.getFullYear() === this.selectedMonth.getFullYear();
        });

        // 3. Grouping data per tanggal
        const groups: { [key: string]: any[] } = {};
        
        // Sort terbaru di atas
        filtered.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        filtered.forEach((item: any) => {
          const dateObj = new Date(item.updatedAt);
          const dateStr = dateObj.toISOString().split('T')[0];
          const label = this.formatDateLabel(dateStr);
          
          if (!groups[label]) groups[label] = [];
          
          // Tambahkan jam selesai untuk tampilan di card
          const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          groups[label].push({ ...item, completedTime: timeLabel });
        });

        this.activityGroups = Object.keys(groups).map(key => ({ 
          dateLabel: key, 
          activities: groups[key] 
        }));
      },
      error: (err) => console.error("Gagal ambil history", err)
    });
  }

  formatDateLabel(dateStr: string): string {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  undoActivity(gIdx: number, aIdx: number) {
    const activity = this.activityGroups[gIdx].activities[aIdx];

    // 1. Update Status ke PENDING di Backend
    this.historyService.updateStatus(activity.id, 'PENDING').subscribe({
      next: () => {
        // 2. Update localStorage ml_result agar sinkron dengan Schedule (Schedule masih baca local)
        const mlData = localStorage.getItem('ml_result');
        if (mlData) {
          let mlResult = JSON.parse(mlData);
          const envKey = activity.environment.toLowerCase();
          const workoutPlan = mlResult.workoutRecommendation[envKey].workout_plan;
          
          for (let dayKey in workoutPlan) {
            const target = workoutPlan[dayKey].find((ex: any) => ex.exercise_name === activity.title);
            if (target) { 
              target.status = 'Pending'; 
              break; 
            }
          }
          localStorage.setItem('ml_result', JSON.stringify(mlResult));
        }

        // 3. Hapus dari tampilan history secara lokal
        this.activityGroups[gIdx].activities.splice(aIdx, 1);
        if (this.activityGroups[gIdx].activities.length === 0) {
          this.activityGroups.splice(gIdx, 1);
        }
      },
      error: (err) => console.error("Gagal undo status", err)
    });
  }

  // --- MODAL & UI LOGIC ---
  openPeriodModal() { this.isPeriodModalOpen = true; }
  closePeriodModal() { this.isPeriodModalOpen = false; }
  closeHistory() { this.router.navigate(['/dashboard/schedule']); }
  
  applyPeriodSelection() {
    this.selectedMonth = new Date(this.tempYear, this.tempMonthIndex);
    this.loadHistoryData();
    this.closePeriodModal();
  }
  
  onScrollMonth(e: any) { this.tempMonthIndex = Math.round(e.target.scrollTop / 40); }
  onScrollYear(e: any) { this.tempYear = this.yearsList[Math.round(e.target.scrollTop / 40)]; }
}