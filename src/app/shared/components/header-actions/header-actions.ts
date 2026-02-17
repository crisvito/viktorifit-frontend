import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { AuthService, WorkoutHistoryService } from '../../../core';

interface AppNotification {
  id: string; 
  type: 'workout' | 'form';
  title: string;
  message: string;
  link: string;
  time?: string;
}

interface NotificationState {
  [key: string]: {
    time: string;
    dismissed: boolean;
  };
}

@Component({
  selector: 'app-header-actions',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './header-actions.html',
  styleUrl: './header-actions.css',
})
export class HeaderActions implements OnInit {
  isOpen = false;
  selectedId: string | null = null;
  showToast = false;
  notifications: AppNotification[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private historyService: WorkoutHistoryService
  ) {}

  ngOnInit() {
    this.checkTodayPendingWorkouts();
    
    // Subscribe ke status ML, jika data siap, cek ulang notifikasi
    this.authService.mlDataReady$.subscribe(isReady => {
        if (isReady) {
          this.checkTodayPendingWorkouts();
        }
    });
  }

  // --- HELPER DATE ---
  private getLocalDateString(dateInput: string | Date): string {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- HELPER LOCAL STORAGE STATE ---
  private getNotificationState(): NotificationState {
    const data = localStorage.getItem('notification_state');
    return data ? JSON.parse(data) : {};
  }

  private saveNotificationState(state: NotificationState) {
    localStorage.setItem('notification_state', JSON.stringify(state));
  }

  // --- LOGIC UTAMA (UPDATED) ---
  checkTodayPendingWorkouts() {
    const user = this.authService.getUser();
    if (!user) return;

    // 1. Prioritaskan data matang (ml_data_ready), fallback ke raw (ml_result)
    const rawData = localStorage.getItem('ml_data_ready') || localStorage.getItem('ml_result');
    if (!rawData) return;

    const parsedData = JSON.parse(rawData);
    
    // Ambil Hari User & Hari Ini
    const daysStr = parsedData.userProfile?.workoutDays || "";
    const userWorkoutDays = daysStr.split(',').map((d: string) => d.trim()).filter((d: string) => d !== "");
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    
    // --- LOGIKA HARI (FIXED: SAMA DENGAN DASHBOARD) ---
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sortedDays = userWorkoutDays.sort((a: any, b: any) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    const dayPosition = sortedDays.indexOf(todayShort);
    
    // Jika hari ini Rest Day, stop (kosongkan notif workout)
    if (dayPosition === -1) {
        this.notifications = this.notifications.filter(n => n.type !== 'workout');
        return; 
    }

    const targetDayNum = dayPosition + 1; // Index 0 = Day 1

    // Ambil Plan (Support CamelCase dari DB & SnakeCase dari ML)
    const homePlan = parsedData.workoutRecommendation?.home?.workoutPlan || parsedData.workoutRecommendation?.home?.workout_plan || {};
    const gymPlan = parsedData.workoutRecommendation?.gym?.workoutPlan || parsedData.workoutRecommendation?.gym?.workout_plan || {};

    const homeDayKey = Object.keys(homePlan).find(k => k.toLowerCase().includes(`day ${targetDayNum}`));
    const gymDayKey = Object.keys(gymPlan).find(k => k.toLowerCase().includes(`day ${targetDayNum}`));

    // Kumpulkan Nama Latihan Hari Ini
    let todayPlanNames: string[] = [];
    
    const extractNames = (plan: any, key: string) => {
        if (key && plan[key]) {
            plan[key].forEach((ex: any) => {
                const name = ex.exerciseName || ex.exercise_name;
                if (name) todayPlanNames.push(name);
            });
        }
    };

    extractNames(homePlan, homeDayKey || '');
    extractNames(gymPlan, gymDayKey || '');
    
    // Hapus duplikat
    todayPlanNames = [...new Set(todayPlanNames)];

    // 2. CEK DATABASE & MATCHING
    this.historyService.getHistory(user.id).subscribe({
      next: (historyData) => {
        const todayDateStr = this.getLocalDateString(new Date());

        // Ambil yang sudah selesai hari ini
        const finishedToday = historyData.filter((h: any) => {
          const hDate = this.getLocalDateString(h.updatedAt);
          return h.status === 'FINISHED' && hDate === todayDateStr;
        });
        
        // Buat list nama yang sudah selesai (lowercase & trim untuk akurasi)
        const finishedTitles = finishedToday.map((h: any) => h.title.toLowerCase().trim());

        // Filter: Plan yang BELUM ada di list finished
        const pendingNames = todayPlanNames.filter(planName => {
          return !finishedTitles.includes(planName.toLowerCase().trim());
        });

        // 3. GENERATE NOTIFICATION ITEMS
        this.processNotifications(pendingNames, todayDateStr);
      },
      error: (err) => console.error("Gagal load history notifikasi", err)
    });
  }

  processNotifications(pendingNames: string[], dateStr: string) {
      let state = this.getNotificationState();
      let isStateChanged = false;
      const newNotifications: AppNotification[] = [];

      pendingNames.forEach((name) => {
          const uniqueKey = `${dateStr}_${name.toLowerCase().trim()}`;
          let notifData = state[uniqueKey];

          // Jika user sudah dismiss, skip
          if (notifData && notifData.dismissed) return;

          // Jika data belum ada, catat waktu sekarang
          if (!notifData) {
              notifData = {
                  time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                  dismissed: false
              };
              state[uniqueKey] = notifData;
              isStateChanged = true;
          }

          newNotifications.push({
              id: uniqueKey,
              type: 'workout',
              title: `Reminder: ${name}`,
              message: `Latihan '${name}' belum selesai hari ini.`,
              link: '/dashboard/schedule',
              time: notifData.time
          });
      });

      // Update UI Variable
      this.notifications = newNotifications;

      // Simpan State jika ada perubahan
      if (isStateChanged) {
          this.saveNotificationState(state);
          this.triggerNewNotification();
      }
  }

  // --- ACTION HANDLERS ---
  toggleDropdown() { this.isOpen = !this.isOpen; this.selectedId = null; }
  
  onSingleClick(id: string) { this.selectedId = (this.selectedId === id) ? null : id; }
  
  onDoubleClick(link: string) { 
    this.isOpen = false; 
    this.router.navigate([link]); 
  }
  
  onDelete(event: Event, id: string) {
    event.stopPropagation();
    
    // 1. Hapus dari UI
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.selectedId = null;

    // 2. Update Local Storage (Set Dismissed = true)
    const state = this.getNotificationState();
    if (state[id]) {
      state[id].dismissed = true;
      this.saveNotificationState(state);
    }
  }

  triggerNewNotification() {
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000);
  }
}