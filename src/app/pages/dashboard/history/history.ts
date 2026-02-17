import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService } from '../../../core'; 

@Component({
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
  private currentUserId: number = 1;

  // Kamus besar untuk mencari info gambar & waktu yang tidak ada di DB
  private allExercisesLookup: any[] = [];

  constructor(
    private router: Router,
    private historyService: WorkoutHistoryService
  ) {}

  ngOnInit() { 
    // 1. Siapkan data lookup dari LocalStorage agar history punya info lengkap
    const mlData = localStorage.getItem('ml_data_ready');
    if (mlData) {
        this.prepareLookupData(JSON.parse(mlData));
    }
    
    // 2. Load data history
    this.loadHistoryData(); 
  }

  // Meratakan semua latihan dari LocalStorage ke 1 array agar mudah dicari detailnya
  prepareLookupData(data: any) {
      const homePlan = data?.workoutRecommendation?.home?.workout_plan || {};
      const gymPlan = data?.workoutRecommendation?.gym?.workout_plan || {};
      this.allExercisesLookup = [];
      [homePlan, gymPlan].forEach(plan => {
          Object.values(plan).forEach((dayList: any) => {
              if (Array.isArray(dayList)) this.allExercisesLookup.push(...dayList);
          });
      });
  }

  loadHistoryData() {
    this.historyService.getHistory(this.currentUserId).subscribe({
      next: (data) => {
        // 1. Filter: FINISHED & Sesuai Periode
        const filtered = data.filter((item: any) => {
          const date = new Date(item.updatedAt); 
          return item.status === 'FINISHED' && 
                 date.getMonth() === this.selectedMonth.getMonth() && 
                 date.getFullYear() === this.selectedMonth.getFullYear();
        });

        // 2. Sort: Terbaru di atas
        filtered.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        // 3. Grouping & Enrichment
        const groups: { [key: string]: any[] } = {};
        
        filtered.forEach((item: any) => {
          // --- LOGIC ENRICHMENT (Cari Gambar & Detail Waktu) ---
          const details = this.allExercisesLookup.find(p => 
             p.exercise_name.toLowerCase().trim() === item.title.toLowerCase().trim()
          );

          let imgUrl = 'assets/images/placeholder_exercise.png';
          let muscle = "General";
          let desc = "Well done! You've completed this session.";
          let durationVal = 0;
          let restVal = 0;

          if (details) {
              imgUrl = details.imageUrl || imgUrl;
              muscle = details.muscle_group || muscle;
              desc = details.instructions || desc;
              durationVal = Number(details.duration_minutes) || 0;
              restVal = Number(details.rest_minutes) || 0;
          } else {
              // Fallback parse dari string DB "15 Min"
              durationVal = parseInt(item.totalTime) || 0;
          }

          const sets = Number(item.sets) || 1;
          const restPerSet = sets > 0 ? Math.round(restVal / sets) : 0;

          const dateObj = new Date(item.updatedAt);
          const dateStr = dateObj.toISOString().split('T')[0];
          const label = this.formatDateLabel(dateStr);
          
          if (!groups[label]) groups[label] = [];
          
          const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          
          // Gabungkan data DB + detail LocalStorage
          groups[label].push({ 
              ...item, 
              imageUrl: imgUrl,
              description: desc,
              tag: muscle,
              timePerSet: `${durationVal} min`,
              rest: restPerSet,
              completedTime: timeLabel 
          });
        });

        this.activityGroups = Object.keys(groups).map(key => ({ 
          dateLabel: key, 
          activities: groups[key] 
        }));
      },
      error: (err) => console.error("Gagal load history", err)
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
    const payload = { ...activity, status: 'PENDING' };
    
    this.historyService.saveHistory(payload).subscribe({
      next: () => {
        this.activityGroups[gIdx].activities.splice(aIdx, 1);
        if (this.activityGroups[gIdx].activities.length === 0) {
          this.activityGroups.splice(gIdx, 1);
        }
      }
    });
  }

  // --- MODAL & UI LOGIC ---
  openPeriodModal() { 
    this.tempMonthIndex = this.selectedMonth.getMonth();
    this.tempYear = this.selectedMonth.getFullYear();
    this.isPeriodModalOpen = true; 
  }
  closePeriodModal() { this.isPeriodModalOpen = false; }
  closeHistory() { this.router.navigate(['/dashboard/schedule']); }
  
  applyPeriodSelection() {
    this.selectedMonth = new Date(this.tempYear, this.tempMonthIndex, 1);
    this.loadHistoryData();
    this.closePeriodModal();
  }
  
  onScrollMonth(e: any) { this.tempMonthIndex = Math.round(e.target.scrollTop / 40); }
  onScrollYear(e: any) { 
    const index = Math.round(e.target.scrollTop / 40);
    if(this.yearsList[index]) this.tempYear = this.yearsList[index];
  }
}