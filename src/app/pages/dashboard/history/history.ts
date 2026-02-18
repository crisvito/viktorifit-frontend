import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../../shared/components';
import { WorkoutHistoryService, AuthService } from '../../../core'; 

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarComponent],
  templateUrl: './history.html',
})
export class History implements OnInit {
  // UI State
  isPeriodModalOpen = false;
  selectedMonth: Date = new Date();
  tempMonthIndex: number = new Date().getMonth();
  tempYear: number = new Date().getFullYear();
  selectedMode: 'Home' | 'Gym' = 'Home'; // Variabel yang tadi hilang
  
  monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  yearsList = [2024, 2025, 2026];
  
  activityGroups: any[] = [];
  private currentUserId: number = 0;

  // Kamus besar untuk mencari info gambar & instruksi yang tidak ada di DB
  private allExercisesLookup: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private historyService: WorkoutHistoryService
  ) {}

  ngOnInit() { 
    // 1. Ambil User ID Dinamis dari AuthService
    const user = this.authService.getUser();
    this.currentUserId = user?.id || 0;

    // 2. Siapkan data lookup detail latihan dari Cache ML
    const mlData = localStorage.getItem('ml_data_ready');
    if (mlData) {
        this.prepareLookupData(JSON.parse(mlData));
    }
    
    // 3. Load data history dari Database
    this.loadHistoryData(); 
  }

  // Meratakan rencana latihan ke 1 array agar mudah dicari detail gambarnya
  prepareLookupData(data: any) {
      const homePlan = data?.workoutRecommendation?.home?.workoutPlan || data?.workoutRecommendation?.home?.workout_plan || {};
      const gymPlan = data?.workoutRecommendation?.gym?.workoutPlan || data?.workoutRecommendation?.gym?.workout_plan || {};
      
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
        // 1. Filter: Hanya status FINISHED & Sesuai Periode Bulan/Tahun yang dipilih user
        const filtered = data.filter((item: any) => {
          const date = new Date(item.updatedAt); 
          return item.status === 'FINISHED' && 
                 date.getMonth() === this.selectedMonth.getMonth() && 
                 date.getFullYear() === this.selectedMonth.getFullYear();
        });

        // 2. Sort: Terbaru di atas (Desc)
        filtered.sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        // 3. Grouping & Enrichment (Menambahkan gambar/muscle group yang hilang di DB)
        const groups: { [key: string]: any[] } = {};
        
        filtered.forEach((item: any) => {
          const details = this.allExercisesLookup.find(p => {
             const pName = (p.exerciseName || p.exercise_name || "").toLowerCase().trim();
             return pName === item.title.toLowerCase().trim();
          });

          let imgUrl = 'assets/images/placeholder_exercise.png';
          let muscle = "General";
          let desc = "Well done! You've completed this session.";
          let durationVal = parseInt(item.totalTime) || 0;
          let restVal = 0;

          if (details) {
              imgUrl = details.imageUrl || imgUrl;
              muscle = details.muscleGroup || details.muscle_group || muscle;
              desc = details.instructions || desc;
              restVal = Number(details.restMinutes || details.rest_minutes) || 0;
          }

          const sets = Number(item.sets) || 1;
          const restPerSet = sets > 0 ? Math.round(restVal / sets) : 0;

          // Format Tanggal Lokal (Bukan UTC)
          const dateObj = new Date(item.updatedAt);
          const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
          const label = this.formatDateLabel(dateStr);
          
          if (!groups[label]) groups[label] = [];
          
          const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          
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
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  // Kembalikan ke Schedule (Set status PENDING lagi)
  undoActivity(gIdx: number, aIdx: number) {
    const activity = this.activityGroups[gIdx].activities[aIdx];
    const payload = { 
        ...activity, 
        status: 'PENDING',
        userId: this.currentUserId 
    };
    
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
  
  onScrollMonth(e: any) { 
      const index = Math.round(e.target.scrollTop / 40);
      if (index >= 0 && index < 12) this.tempMonthIndex = index;
  }
  
  onScrollYear(e: any) { 
    const index = Math.round(e.target.scrollTop / 40);
    if(this.yearsList[index]) this.tempYear = this.yearsList[index];
  }

  // Fungsi tambahan kalau HTML butuh ganti mode
  setMode(mode: 'Home' | 'Gym') {
    this.selectedMode = mode;
    this.loadHistoryData();
  }
}