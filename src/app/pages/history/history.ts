import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router } from '@angular/router'; 
import { CalendarComponent } from '../../shared/components/calendar.component/calendar.component'; 

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CalendarComponent], 
  templateUrl: './history.html',
})
export class History {

  // --- VARIABLES ---
  isModeOpen = false;
  selectedMode = 'Home';
  
  // Variable untuk Modal
  isLogModalOpen = false;
  logForm = {
    name: '',
    description: '',
    duration: ''
  };

  // --- DATA DUMMY: TODAY ---
  // PERBAIKAN: Tambahkan ': any[]' agar tidak error saat loop di HTML
  todayActivities: any[] = [
    {
      title: 'Running',
      description: 'Swimming is a workout that need water to do Swimming is a workout that need',
      tag: 'Cardio',
      time: '60 minutes',
      calories: '20 cal',
      progress: 0,
      logs: [],
      status: 'active',
      expanded: false
    },
    {
      title: 'Dancing',
      description: 'Swimming is a workout that need water to do Swimming is a workout that need',
      tag: 'Cardio',
      time: '60 minutes',
      calories: '20 cal',
      progress: 50,
      logs: [
        { name: 'Log 1', description: 'Half session', duration: '30 mins' }
      ],
      status: 'active',
      expanded: false
    }
  ];

  // --- DATA DUMMY: YESTERDAY ---
  // PERBAIKAN: Tambahkan ': any[]' di sini juga
  yesterdayActivities: any[] = [
    {
      title: 'Running',
      description: 'Swimming is a workout that need water to do Swimming is a workout that need',
      tag: 'Cardio',
      time: '60 minutes',
      calories: '20 cal',
      progress: 0,
      // Karena logs kosong [], tanpa ': any[]' TS akan menganggapnya tipe 'never[]' (error saat dipanggil .name)
      logs: [], 
      status: 'unfinished',
      expanded: false
    }
  ];

  constructor(private router: Router) {}

  // --- NAVIGATION ---
  closeHistory() {
    this.router.navigate(['/schedule']); 
  }

  // --- INTERACTION ---
  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  // --- MODAL LOGIC ---
  openLogModal(index: number) {
    this.logForm = {
      name: '',
      description: '',
      duration: ''
    };
    this.isLogModalOpen = true;
  }

  closeLogModal() {
    this.isLogModalOpen = false;
  }

  saveNewLog() {
    console.log('New log saved:', this.logForm);
    this.closeLogModal();
  }

  // --- MODE DROPDOWN ---
  toggleMode() {
    this.isModeOpen = !this.isModeOpen;
  }

  setMode(mode: string) {
    this.selectedMode = mode;
    this.isModeOpen = false;
  }
}