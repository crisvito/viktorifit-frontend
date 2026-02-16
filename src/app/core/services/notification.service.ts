import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppNotification {
  id: number;
  type: 'workout' | 'form';
  title: string;
  message: string;
  link: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Data Dummy
  private initialData: AppNotification[] = [
    { 
      id: 1, 
      type: 'workout', 
      title: 'Upper Body Strength', 
      message: 'Jadwal latihanmu dimulai pukul 16:00 WIB.', 
      link: '/workout-schedule',
      timestamp: new Date()
    },
    { 
      id: 2, 
      type: 'form', 
      title: 'Weekly Progress', 
      message: 'Jangan lupa isi form evaluasi mingguanmu!', 
      link: '/personal-data',
      timestamp: new Date()
    }
  ];

  // State Notifikasi
  private notificationsSource = new BehaviorSubject<AppNotification[]>(this.initialData);
  public notifications$ = this.notificationsSource.asObservable();

  // State Toast (Popup 5 Detik)
  private showToastSource = new BehaviorSubject<boolean>(false);
  public showToast$ = this.showToastSource.asObservable();

  // Tambah Notifikasi (Panggil ini buat ngetest)
  addNotification(notif: AppNotification) {
    const current = this.notificationsSource.value;
    this.notificationsSource.next([notif, ...current]);
    this.triggerToast();
  }

  // Hapus Notifikasi
  deleteNotification(id: number) {
    const current = this.notificationsSource.value;
    this.notificationsSource.next(current.filter(n => n.id !== id));
  }

  // Timer Toast 5 Detik
  private triggerToast() {
    this.showToastSource.next(true);
    setTimeout(() => {
      this.showToastSource.next(false);
    }, 5000);
  }
}