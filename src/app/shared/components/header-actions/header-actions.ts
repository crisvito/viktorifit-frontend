import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { AuthService, WorkoutHistoryService } from '../../../core';

interface AppNotification {
  id: string; // Ubah jadi String (untuk Unique Key)
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
  selectedId: string | null = null; // Ubah jadi string
  showToast = false;
  notifications: AppNotification[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private historyService: WorkoutHistoryService
  ) {}

  ngOnInit() {
    this.checkTodayPendingWorkouts();
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

  // --- LOGIC UTAMA ---
  checkTodayPendingWorkouts() {
    const user = this.authService.getUser();
    if (!user) return;

    // 1. AMBIL RENCANA (Sama seperti sebelumnya)
    const mlData = localStorage.getItem('ml_result');
    if (!mlData) return;

    const parsedML = JSON.parse(mlData);
    const daysStr = parsedML.userProfile?.workoutDays || "";
    const userWorkoutDays = daysStr.split(',').map((d: string) => d.trim());
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    
    const dayIndex = userWorkoutDays.indexOf(todayShort);
    if (dayIndex === -1) return; // Rest Day

    const targetDayNum = dayIndex + 1;
    const homePlan = parsedML.workoutRecommendation?.home?.workout_plan || {};
    const gymPlan = parsedML.workoutRecommendation?.gym?.workout_plan || {};

    const homeDayKey = Object.keys(homePlan).find(k => k.toLowerCase().includes(`day ${targetDayNum}`));
    const gymDayKey = Object.keys(gymPlan).find(k => k.toLowerCase().includes(`day ${targetDayNum}`));

    let todayPlanNames: string[] = [];
    if (homeDayKey && homePlan[homeDayKey]) {
      homePlan[homeDayKey].forEach((ex: any) => todayPlanNames.push(ex.exercise_name));
    }
    if (gymDayKey && gymPlan[gymDayKey]) {
      gymPlan[gymDayKey].forEach((ex: any) => todayPlanNames.push(ex.exercise_name));
    }
    todayPlanNames = [...new Set(todayPlanNames)];

    // 2. CEK DATABASE & MATCHING
    this.historyService.getHistory(user.id).subscribe({
      next: (historyData) => {
        const todayDateStr = this.getLocalDateString(new Date());

        // Ambil yang sudah selesai
        const finishedToday = historyData.filter((h: any) => {
          const hDate = this.getLocalDateString(h.updatedAt);
          return h.status === 'FINISHED' && hDate === todayDateStr;
        });
        const finishedTitles = finishedToday.map((h: any) => h.title.toLowerCase().trim());

        // Filter nama yang belum selesai
        const pendingNames = todayPlanNames.filter(planName => {
          return !finishedTitles.includes(planName.toLowerCase().trim());
        });

        // 3. LOGIC BARU: CEK STATE (DISMISSED & TIME)
        let state = this.getNotificationState();
        let isStateChanged = false;

        this.notifications = pendingNames
          .map((name) => {
            // GENERATE UNIQUE KEY: "2026-02-17_push up"
            const uniqueKey = `${todayDateStr}_${name.toLowerCase().trim()}`;
            
            // Cek apakah data ini sudah ada di state
            let notifData = state[uniqueKey];

            // A. Kalau user sudah hapus (dismissed), jangan tampilkan (return null)
            if (notifData && notifData.dismissed) {
              return null;
            }

            // B. Kalau data belum ada, buat baru (Time = Now)
            if (!notifData) {
              notifData = {
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                dismissed: false
              };
              state[uniqueKey] = notifData; // Simpan ke object state sementara
              isStateChanged = true;        // Tandai ada perubahan
            }

            // Return object notifikasi
            return {
              id: uniqueKey, // ID sekarang pakai Key Unik string
              type: 'workout',
              title: `Reminder: ${name}`,
              message: `Latihan '${name}' belum selesai hari ini.`,
              link: '/dashboard/schedule',
              time: notifData.time // Pakai waktu dari storage (tetap konsisten)
            } as AppNotification;
          })
          .filter(n => n !== null) as AppNotification[]; // Hapus yang null (dismissed)

        // Simpan state baru jika ada notif baru yang ditambahkan
        if (isStateChanged) {
          this.saveNotificationState(state);
          this.triggerNewNotification(); // Toast muncul cuma kalau ada notif BARU
        }

        // --- TAMBAHAN NOTIF MINGGUAN (Opsional) ---
        // Kamu bisa pakai logic yang sama buat ini biar bisa dihapus permanen minggu ini
      },
      error: (err) => console.error(err)
    });
  }

  // --- ACTION HANDLERS ---

  toggleDropdown() { this.isOpen = !this.isOpen; this.selectedId = null; }
  
  onSingleClick(id: string) { this.selectedId = (this.selectedId === id) ? null : id; }
  
  onDoubleClick(link: string) { 
    this.isOpen = false; 
    this.router.navigate([link]); 
  }
  
  // LOGIC DELETE BARU
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