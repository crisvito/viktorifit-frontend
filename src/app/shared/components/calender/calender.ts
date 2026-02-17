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

  programStartDate: Date = new Date();
  programEndDate: Date = new Date();

  private readyData: any = null;

  ngOnInit() {
    this.loadAndInitialize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['workoutDays'] || changes['selectedMode']) {
      this.generateCalendar();
      this.calculateSummary();
    }
  }

  loadAndInitialize() {
    const data = localStorage.getItem('ml_data_ready');
    if (data) {
      this.readyData = JSON.parse(data);
      
      // 1. Set Start Date dari profil (Kapan program dibuat)
      const updatedAt = this.readyData.userProfile?.updatedAt;
      this.programStartDate = updatedAt ? new Date(updatedAt) : new Date();
      this.programStartDate.setHours(0, 0, 0, 0);

      // 2. Set End Date (Start + 12 Minggu)
      this.programEndDate = new Date(this.programStartDate);
      this.programEndDate.setDate(this.programStartDate.getDate() + (12 * 7));

      // 3. Ambil workout days jika @Input kosong
      if (!this.workoutDays || this.workoutDays.length === 0) {
        const daysString = this.readyData.userProfile?.workoutDays || "";
        this.workoutDays = daysString.split(',').map((d: string) => d.trim());
      }
    }

    this.generateCalendar();
    this.calculateSummary();
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
      const checkDate = new Date(year, month, day);
      checkDate.setHours(0, 0, 0, 0);

      const dayNameShort = checkDate.toLocaleDateString('en-US', { weekday: 'short' }); 
      
      const isDayMatch = this.workoutDays.some(d => d.trim().toLowerCase() === dayNameShort.toLowerCase());
      const isWithinProgram = checkDate >= this.programStartDate && checkDate <= this.programEndDate;

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
    if (!this.readyData) return;

    try {
      // Ambil data Home & Gym dari Enriched Data
      this.homeStats = this.extractStatsFromPlan(this.readyData.workoutRecommendation?.home?.workout_plan);
      this.gymStats = this.extractStatsFromPlan(this.readyData.workoutRecommendation?.gym?.workout_plan);
    } catch (e) {
      console.error("Error calculating summary", e);
    }
  }

  private extractStatsFromPlan(plan: any) {
    if (!plan) return { duration: '0 Mins', calories: '0 cal' };

    const days = Object.keys(plan);
    if (days.length === 0) return { duration: '0 Mins', calories: '0 cal' };

    let totalMins = 0;
    let totalCals = 0;

    // Hitung rata-rata dari semua hari yang ada di plan
    days.forEach(dayKey => {
      const exercises = plan[dayKey];
      if (Array.isArray(exercises)) {
        exercises.forEach((ex: any) => {
          totalMins += (Number(ex.duration_minutes) || 0) + (Number(ex.rest_minutes) || 0);
          totalCals += (Number(ex.calories_burned) || 0);
        });
      }
    });

    const avgMins = Math.round(totalMins / days.length);
    const avgCals = Math.round(totalCals / days.length);

    return { 
      duration: `${avgMins} Mins`, 
      calories: `${avgCals} cal` 
    };
  }

  changeMonth(offset: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.generateCalendar();
  }
}