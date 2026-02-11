import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CalendarComponent } from '../../shared/components/calendar.component/calendar.component';

interface Activity {
  id: number;
  title: string;
  description: string;
  tag: string;
  time: string;
  calories: string;
  progress: number;
  status: 'finished' | 'unfinished';
  date: Date;
  logs: { name: string; description: string; duration: string }[];
  expanded: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CalendarComponent],
  templateUrl: './history.html',
})
export class History implements OnInit {
  isModeOpen = false;
  selectedMode = 'Home';

  isPeriodModalOpen = false;
  selectedMonth: Date = new Date();
  tempMonthIndex: number = 0;
  tempYear: number = 2025;

  monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  yearsList: number[] = [];
  readonly ITEM_HEIGHT = 40;

  isLogModalOpen = false;
  selectedActivity: Activity | null = null;
  logForm = {
    name: '',
    description: '',
    duration: '',
  };

  allActivities: Activity[] = [];
  activityGroups: { dateLabel: string; activities: Activity[] }[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.generateYearsList();

    const now = new Date();
    this.tempMonthIndex = now.getMonth();
    this.tempYear = now.getFullYear();
    this.selectedMonth = now;

    this.allActivities = this.generateDynamicMockData();
    this.applyFilter();
  }

  parseMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    const lower = timeStr.toLowerCase();
    const number = parseInt(lower.replace(/\D/g, '')) || 0;

    if (lower.includes('hour') || lower.includes('jam')) {
      return number * 60;
    }
    return number;
  }

  calculateStatus(activity: Activity) {
    const targetMinutes = this.parseMinutes(activity.time);

    const currentMinutes = activity.logs.reduce((total, log) => {
      return total + this.parseMinutes(log.duration);
    }, 0);

    let progress = 0;
    if (targetMinutes > 0) {
      progress = Math.round((currentMinutes / targetMinutes) * 100);
    }
    activity.progress = Math.min(100, progress);

    if (currentMinutes >= targetMinutes) {
      activity.status = 'finished';
    } else {
      activity.status = 'unfinished';
    }
  }

  generateDynamicMockData(): Activity[] {
    const activities: Activity[] = [];
    const titles = ['Running', 'Swimming', 'Cycling', 'Yoga', 'Gym Chest Day', 'Pilates', 'HIIT'];
    const tags = ['Cardio', 'Strength', 'Flexibility', 'Endurance'];
    const standardDurations = ['30 minutes', '45 minutes', '60 minutes', '90 minutes', '120 minutes', '15 minutes'];

    const baseDate = new Date();
    
    for (let i = 0; i < 50; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() - (i % 20)); 

      const targetTimeStr = standardDurations[i % standardDurations.length];

      const newActivity: Activity = {
        id: i,
        title: titles[i % titles.length],
        description: 'Workout session to maintain health.',
        tag: tags[i % tags.length],
        time: targetTimeStr,
        calories: `${(i * 50) + 100} cal`,
        progress: 0,
        status: 'unfinished',
        date: date,
        logs: [],
        expanded: false,
      };

      if (i % 2 === 0) {
        const durationVal = this.parseMinutes(targetTimeStr);
        const logVal = (i % 3 === 0) ? durationVal : Math.floor(durationVal / 2);
        
        newActivity.logs.push({
          name: 'Session 1',
          description: 'Initial warmup',
          duration: `${logVal} mins`,
        });
      }

      this.calculateStatus(newActivity);
      activities.push(newActivity);
    }

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  generateYearsList() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.yearsList.push(i);
    }
  }

  onScrollMonth(event: any) {
    const scrollTop = event.target.scrollTop;
    const index = Math.round(scrollTop / this.ITEM_HEIGHT);
    if (index >= 0 && index < this.monthsList.length) {
      this.tempMonthIndex = index;
    }
  }

  onScrollYear(event: any) {
    const scrollTop = event.target.scrollTop;
    const index = Math.round(scrollTop / this.ITEM_HEIGHT);
    if (index >= 0 && index < this.yearsList.length) {
      this.tempYear = this.yearsList[index];
    }
  }

  openPeriodModal() {
    this.tempMonthIndex = this.selectedMonth.getMonth();
    this.tempYear = this.selectedMonth.getFullYear();
    this.isPeriodModalOpen = true;
    setTimeout(() => {
      this.scrollToActive();
    }, 50);
  }

  closePeriodModal() {
    this.isPeriodModalOpen = false;
  }

  scrollToActive() {
    const monthContainer = document.getElementById('monthContainer');
    const yearContainer = document.getElementById('yearContainer');
    if (monthContainer) monthContainer.scrollTop = this.tempMonthIndex * this.ITEM_HEIGHT;
    if (yearContainer) {
      const yearIndex = this.yearsList.indexOf(this.tempYear);
      if (yearIndex !== -1) yearContainer.scrollTop = yearIndex * this.ITEM_HEIGHT;
    }
  }

  applyPeriodSelection() {
    const newDate = new Date();
    newDate.setFullYear(this.tempYear);
    newDate.setMonth(this.tempMonthIndex);
    newDate.setDate(1);
    this.selectedMonth = newDate;
    this.applyFilter();
    this.closePeriodModal();
  }

  applyFilter() {
    const filteredData = this.allActivities.filter((item) => {
      return (
        item.date.getMonth() === this.selectedMonth.getMonth() &&
        item.date.getFullYear() === this.selectedMonth.getFullYear()
      );
    });
    this.groupActivitiesByDate(filteredData);
  }

  groupActivitiesByDate(activities: Activity[]) {
    const groups: { [key: string]: Activity[] } = {};
    activities.forEach((item) => {
      const dateKey = item.date.toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    const sortedKeys = Object.keys(groups).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    this.activityGroups = sortedKeys.map((dateKey) => {
      return {
        dateLabel: this.getRelativeLabel(new Date(dateKey)),
        activities: groups[dateKey],
      };
    });
  }

  getRelativeLabel(inputDate: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (inputDate.getTime() === today.getTime()) return 'Today';
    else if (inputDate.getTime() === yesterday.getTime()) return 'Yesterday';
    else
      return inputDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
  }

  openLogModal(item: Activity) {
    this.selectedActivity = item;
    this.logForm = { name: '', description: '', duration: '' };
    this.isLogModalOpen = true;
  }

  closeLogModal() {
    this.isLogModalOpen = false;
    this.selectedActivity = null;
  }

  saveNewLog() {
    if (this.selectedActivity) {
      this.selectedActivity.logs.push({
        name: this.logForm.name,
        description: this.logForm.description,
        duration: this.logForm.duration,
      });

      this.calculateStatus(this.selectedActivity);
    }
    this.closeLogModal();
  }

  closeHistory() {
    this.router.navigate(['/schedule']);
  }

  toggleExpand(item: any) {
    item.expanded = !item.expanded;
  }

  toggleMode() {
    this.isModeOpen = !this.isModeOpen;
  }

  setMode(mode: string) {
    this.selectedMode = mode;
    this.isModeOpen = false;
  }
}