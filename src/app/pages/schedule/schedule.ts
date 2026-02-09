import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
})
export class Schedule implements OnInit {

  isModeOpen = false;
  selectedMode = 'Home';
  isLogModalOpen = false;
  
  // Form Model
  logForm = {
    name: '',
    description: '',
    duration: ''
  };

  selectedActivityIndex: number = -1;

  // Data Activity
  homeData: any[] = [];
  gymData: any[] = [];
  activities: any[] = [];

  // --- CALENDAR LOGIC VARIABLES ---
  currentDate = new Date(); // Tanggal saat ini untuk navigasi bulan
  displayMonthYear = '';    // String "January 2025"
  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Header hari
  calendarDays: any[][] = []; // Array 2D untuk grid kalender
  selectedDates: Set<string> = new Set(); // Menyimpan tanggal yg dipilih (format: "YYYY-MM-DD")

  ngOnInit() {
    // Load Activity Data
    const storedHome = localStorage.getItem('viktorifit_home');
    const storedGym = localStorage.getItem('viktorifit_gym');

    if (storedHome) {
      this.homeData = JSON.parse(storedHome);
    } else {
      this.homeData = this.getDefaultHomeData();
    }

    if (storedGym) {
      this.gymData = JSON.parse(storedGym);
    } else {
      this.gymData = this.getDefaultGymData();
    }

    this.activities = this.homeData;

    // Load Calendar Data
    this.loadSelectedDates();
    this.generateCalendar();
  }

  // --- CALENDAR FUNCTIONS ---

  loadSelectedDates() {
    const storedDates = localStorage.getItem('viktorifit_calendar_dates');
    if (storedDates) {
      // Convert array kembali ke Set
      this.selectedDates = new Set(JSON.parse(storedDates));
    }
  }

  saveSelectedDates() {
    // Convert Set ke Array untuk disimpan
    localStorage.setItem('viktorifit_calendar_dates', JSON.stringify(Array.from(this.selectedDates)));
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Set Header Teks (e.g., "January 2025")
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.displayMonthYear = `${monthNames[month]} ${year}`;

    // Hitung hari pertama bulan ini jatuh di hari apa
    // getDay(): 0 = Sunday, 1 = Monday. Kita mau Monday = 0.
    const firstDay = new Date(year, month, 1).getDay();
    // Adjust supaya Senin jadi index 0, Minggu jadi index 6
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    // Hitung jumlah hari dalam bulan ini
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Reset Grid
    this.calendarDays = [];
    let week: any[] = [];

    // Isi kotak kosong sebelum tanggal 1
    for (let i = 0; i < startDayIndex; i++) {
      week.push(''); 
    }

    // Isi tanggal 1 sampai akhir bulan
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(day);
      // Jika sudah 7 hari (penuh seminggu), push ke calendarDays dan reset week
      if (week.length === 7) {
        this.calendarDays.push(week);
        week = [];
      }
    }

    // Isi sisa kotak kosong setelah tanggal terakhir (jika ada sisa)
    if (week.length > 0) {
      while (week.length < 7) {
        week.push('');
      }
      this.calendarDays.push(week);
    }
  }

  changeMonth(offset: number) {
    // Ubah bulan saat ini (+1 atau -1)
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    // Regenerate kalender
    this.generateCalendar();
  }

  toggleDate(day: any) {
    if (!day) return; // Jangan lakukan apa-apa jika klik kotak kosong

    // Buat format key unik: "YYYY-MM-DD"
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1; // getMonth() mulai dari 0
    const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // Toggle logic
    if (this.selectedDates.has(dateKey)) {
      this.selectedDates.delete(dateKey); // Hapus jika sudah ada (unselect)
    } else {
      this.selectedDates.add(dateKey); // Tambah jika belum ada (select)
    }

    // Simpan ke database local
    this.saveSelectedDates();
  }

  isDateSelected(day: any): boolean {
    if (!day) return false;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return this.selectedDates.has(dateKey);
  }

  // --- EXISTING ACTIVITY LOGIC ---

  openLogModal(index: number) {
    this.selectedActivityIndex = index;
    const currentLogsCount = this.activities[index].logs ? this.activities[index].logs.length : 0;
    this.logForm = {
      name: `Log ${currentLogsCount + 1}`,
      description: '',
      duration: ''
    };
    this.isLogModalOpen = true;
  }

  closeLogModal() {
    this.isLogModalOpen = false;
  }

  saveNewLog() {
    if (this.selectedActivityIndex === -1) return;
    const activity = this.activities[this.selectedActivityIndex];
    if (!activity.logs) activity.logs = [];

    const inputDuration = parseInt(this.logForm.duration) || 0;
    const newLogEntry = {
      name: this.logForm.name,
      description: this.logForm.description,
      duration: `${inputDuration} mins`,
      durationValue: inputDuration,
      date: new Date()
    };

    activity.logs.push(newLogEntry);
    
    const targetDuration = parseInt(activity.time) || 60;
    let totalLoggedDuration = 0;
    activity.logs.forEach((log: any) => {
        totalLoggedDuration += log.durationValue;
    });

    const calculatedProgress = (totalLoggedDuration / targetDuration) * 100;
    activity.progress = Math.min(Math.round(calculatedProgress), 100);

    if (this.selectedMode === 'Home') {
      localStorage.setItem('viktorifit_home', JSON.stringify(this.homeData));
    } else {
      localStorage.setItem('viktorifit_gym', JSON.stringify(this.gymData));
    }
    this.closeLogModal();
  }

  toggleMode() {
    this.isModeOpen = !this.isModeOpen;
  }

  setMode(mode: string) {
    this.selectedMode = mode;
    this.isModeOpen = false;
    this.activities = (mode === 'Home') ? this.homeData : this.gymData;
  }

  getDefaultHomeData() {
    return [
      {
        title: 'Morning Yoga',
        description: 'Relaxing yoga session to start your day with positive energy.',
        tag: 'Flexibility',
        time: '30 minutes',
        calories: '120 cal',
        progress: 0,
        logs: []
      },
      {
        title: 'Dancing',
        description: 'Fun cardio workout using dance moves to burn calories.',
        tag: 'Cardio',
        time: '45 minutes',
        calories: '300 cal',
        progress: 0,
        logs: []
      }
    ];
  }

  getDefaultGymData() {
    return [
      {
        title: 'Bench Press',
        description: 'Chest workout to build strength and muscle mass.',
        tag: 'Strength',
        time: '15 minutes',
        calories: '150 cal',
        progress: 0,
        logs: []
      },
      {
        title: 'Treadmill Run',
        description: 'High intensity interval running for cardiovascular health.',
        tag: 'Cardio',
        time: '30 minutes',
        calories: '400 cal',
        progress: 0,
        logs: []
      }
    ];
  }
}