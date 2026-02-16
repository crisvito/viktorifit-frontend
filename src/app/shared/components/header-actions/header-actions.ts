import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink } from '@angular/router';
// import { animate, style, transition, trigger } from '@angular/animations';

interface AppNotification {
  id: number;
  type: 'workout' | 'form';
  title: string;
  message: string;
  link: string;
}

@Component({
  selector: 'app-header-actions',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './header-actions.html',
  styleUrl: './header-actions.css',
})

export class HeaderActions {
isOpen = false;
  selectedId: number | null = null;
  showToast = false;

  // DATA DUMMY (Langsung disini)
  notifications: AppNotification[] = [
    { 
      id: 1, 
      type: 'workout', 
      title: 'Upper Body Strength', 
      message: 'Jadwal latihanmu dimulai pukul 16:00 WIB.', 
      link: '/workout-schedule' 
    },
    { 
      id: 2, 
      type: 'form', 
      title: 'Weekly Progress', 
      message: 'Jangan lupa isi form evaluasi mingguanmu!', 
      link: '/personal-data' 
    },
  ];

  constructor(private router: Router) {}

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

  // Fungsi Test Toast (Opsional, buat ngetes munculin pop up 5 detik)
  triggerNewNotification() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
}