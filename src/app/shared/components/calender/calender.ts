import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDate {
  day: number;
  isCurrentMonth: boolean;
  isWorkout: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calender.html',
})
export class CalendarComponent implements OnInit, OnChanges {

  @Input() selectedMode: string = 'Home';
  @Input() workoutDays: string[] = [];

  homeStats = { duration: '0 Mins', calories: '0 cal' };
  gymStats = { duration: '0 Mins', calories: '0 cal' };

  currentDate = new Date(); 
  displayMonthYear = '';    
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']; 
  calendarDays: CalendarDate[][] = []; 

  // --- LOGIC 12 MINGGU ---
  programStartDate: Date = new Date();
  programEndDate: Date = new Date();

  ngOnInit() {
    this.initializeProgramDates(); // Set tanggal mulai & selesai
    this.generateCalendar();
    this.calculateSummary();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workoutDays'] || changes['selectedMode']) {
      this.generateCalendar();
      this.calculateSummary();
    }
  }

  // 1. FUNGSI HITUNG DURASI PROGRAM
  initializeProgramDates() {
    // Di sini kita set Start Date. 
    // Idealnya ambil dari localStorage jika user sudah pernah login sebelumnya.
    // Contoh: const storedStart = localStorage.getItem('program_start_date');
    
    // Untuk sekarang kita pakai 'Hari Ini' sebagai start, atau ambil dari data ML kalau ada created_at
    this.programStartDate = new Date(); 
    
    // Reset jam ke 00:00:00 agar perbandingan tanggal akurat
    this.programStartDate.setHours(0, 0, 0, 0);

    // Hitung End Date: Start + 12 Minggu (84 Hari)
    this.programEndDate = new Date(this.programStartDate);
    this.programEndDate.setDate(this.programStartDate.getDate() + (12 * 7));
  }

  generateCalendar() {
    this.calendarDays = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.displayMonthYear = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let week: CalendarDate[] = [];

    // Padding Bulan Lalu
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      week.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isWorkout: false });
    }

    // Hari Bulan Ini
    for (let day = 1; day <= daysInMonth; day++) {
      // Buat objek tanggal untuk hari yang sedang dicek
      const checkDate = new Date(year, month, day);
      checkDate.setHours(0, 0, 0, 0); // Reset jam biar bandinginnya apel-to-apel

      const dayNameShort = checkDate.toLocaleDateString('en-US', { weekday: 'short' }); 
      
      // LOGIC PENENTUAN WARNA HIJAU:
      // 1. Apakah hari ini (Mon/Tue) adalah jadwal user?
      const isDayMatch = this.workoutDays.some(d => d.trim().toLowerCase() === dayNameShort.toLowerCase());
      
      // 2. Apakah tanggal ini masih dalam periode 12 minggu?
      const isWithinProgram = checkDate >= this.programStartDate && checkDate <= this.programEndDate;

      // Gabungkan kedua syarat
      const isWorkoutDay = isDayMatch && isWithinProgram;

      week.push({ day: day, isCurrentMonth: true, isWorkout: isWorkoutDay });
      
      if (week.length === 7) {
        this.calendarDays.push(week);
        week = [];
      }
    }

    // Padding Bulan Depan
    if (week.length > 0) {
      let nextMonthDay = 1;
      while (week.length < 7) {
        week.push({ day: nextMonthDay++, isCurrentMonth: false, isWorkout: false });
      }
      this.calendarDays.push(week);
    }
  }

  calculateSummary() {
    const data = localStorage.getItem('ml_result');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.homeStats = this.extractStats(parsed.workoutRecommendation?.home?.workout_plan);
        this.gymStats = this.extractStats(parsed.workoutRecommendation?.gym?.workout_plan);
      } catch (e) {
        console.error("Error calculating summary", e);
      }
    }
  }

  private extractStats(plan: any) {
    if (plan) {
      const firstKey = Object.keys(plan)[0];
      if (firstKey && plan[firstKey]) {
         const exs = plan[firstKey];
         const mins = exs.reduce((acc: number, cur: any) => 
            acc + (Number(cur.duration_minutes) || 0) + (Number(cur.rest_minutes) || 0), 0);
         const cals = exs.reduce((acc: number, cur: any) => 
            acc + (Number(cur.calories_burned) || 0), 0);
         
         return { duration: `${mins} Mins`, calories: `${cals} cal` };
      }
    }
    return { duration: '0 Mins', calories: '0 cal' };
  }

  changeMonth(offset: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.generateCalendar();
  }
}