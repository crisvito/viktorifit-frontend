import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { AuthService, WorkoutHistoryService } from '../../../core'; // Import Service

interface AppNotification {
  id: number;
  type: 'workout' | 'form';
  title: string;
  message: string;
  link: string;
  time?: string; // Opsional: Untuk menampilkan jam
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
  selectedId: number | null = null;
  showToast = false;

  notifications: AppNotification[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,      // Inject Auth
    private historyService: WorkoutHistoryService // Inject History
  ) {}

  ngOnInit() {
    this.loadPendingWorkouts();
  }

  loadPendingWorkouts() {
    const user = this.authService.getUser();
    if (!user) return;

    // 1. Ambil History User
    this.historyService.getHistory(user.id).subscribe({
      next: (historyData) => {
        // Ambil tanggal hari ini format YYYY-MM-DD (Waktu Lokal)
        // Trik timezone offset agar tanggal sesuai lokasi user
        const tzOffset = new Date().getTimezoneOffset() * 60000; 
        const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);

        // 2. Filter: Hanya Hari Ini & Status PENDING
        const pendingWorkouts = historyData.filter((h: any) => {
          // Ambil bagian tanggal saja dari updatedAt (misal: 2026-02-17)
          const historyDate = h.updatedAt.toString().split('T')[0];
          
          return historyDate === localISOTime && h.status === 'PENDING';
        });

        // 3. Mapping ke Format Notifikasi
        this.notifications = pendingWorkouts.map((workout: any) => ({
          id: workout.id,
          type: 'workout',
          title: `Reminder: ${workout.title}`,
          message: `Kamu belum menyelesaikan latihan ${workout.title}. Yuk selesaikan sekarang!`,
          link: '/dashboard/schedule', // Arahkan ke Schedule biar bisa di-check
          time: new Date(workout.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }));

        // Opsional: Tambahkan notifikasi Form Evaluasi jika hari Minggu (misalnya)
        const today = new Date();
        if (today.getDay() === 0) { // 0 = Minggu
          this.notifications.push({
            id: 999,
            type: 'form',
            title: 'Weekly Progress',
            message: 'Jangan lupa isi form evaluasi mingguanmu!',
            link: '/dashboard/personal-data'
          });
        }

        // Trigger Toast jika ada notifikasi baru
        if (this.notifications.length > 0) {
          this.triggerNewNotification();
        }
      },
      error: (err) => console.error('Gagal load notifikasi', err)
    });
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    this.selectedId = null;
  }

  // Logic 1: Klik Sekali (Select)
  onSingleClick(id: number) {
    this.selectedId = (this.selectedId === id) ? null : id;
  }

  // Logic 2: Klik Dua Kali (Redirect)
  onDoubleClick(link: string) {
    this.isOpen = false;
    this.router.navigate([link]);
  }

  // Logic 3: Hapus Notif
  onDelete(event: Event, id: number) {
    event.stopPropagation();
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.selectedId = null;
  }

  // Fungsi Toast
  triggerNewNotification() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}