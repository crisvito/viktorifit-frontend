import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDate {
  day: number;
  isCurrentMonth: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
 
    templateUrl: './calender.html',
  styleUrl: './calender.css'
})
export class CalendarComponent implements OnInit {

  @Input() selectedMode: string = 'Home'; 

  currentDate = new Date(); 
  displayMonthYear = '';    
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']; 
  calendarDays: CalendarDate[][] = []; 
  selectedDates: Set<string> = new Set(); 

  ngOnInit() {
    this.loadSelectedDates();
    this.generateCalendar();
  }

  loadSelectedDates() {
    const storedDates = localStorage.getItem('viktorifit_calendar_dates');
    if (storedDates) {
      this.selectedDates = new Set(JSON.parse(storedDates));
    }
  }

  saveSelectedDates() {
    localStorage.setItem('viktorifit_calendar_dates', JSON.stringify(Array.from(this.selectedDates)));
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.displayMonthYear = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const startDayIndex = firstDay

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    this.calendarDays = [];
    let week: CalendarDate[] = [];

    for (let i = startDayIndex - 1; i >= 0; i--) {
      week.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      week.push({ day: day, isCurrentMonth: true });
      
      if (week.length === 7) {
        this.calendarDays.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      let nextMonthDay = 1;
      while (week.length < 7) {
        week.push({ day: nextMonthDay++, isCurrentMonth: false });
      }
      this.calendarDays.push(week);
    }
  }

  changeMonth(offset: number) {
    this.currentDate.setMonth(this.currentDate.getMonth() + offset);
    this.generateCalendar();
  }

  toggleDate(day: any) {
    if (!day) return; 
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1; 
    const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    if (this.selectedDates.has(dateKey)) {
      this.selectedDates.delete(dateKey); 
    } else {
      this.selectedDates.add(dateKey); 
    }
    this.saveSelectedDates();
  }

  isDateSelected(day: any): boolean {
    if (!day) return false;
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;
    const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return this.selectedDates.has(dateKey);
  }
}