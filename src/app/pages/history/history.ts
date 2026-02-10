import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterModule, Router } from '@angular/router'; 
import { CalendarComponent } from '../../shared/components/calendar.component/calendar.component'; 

interface Activity {
  title: string;
  description: string;
  tag: string;
  time: string;
  calories: string;
  progress: number;
  status: 'active' | 'unfinished' | 'ongoing';
  date: Date; 
  logs: any[];
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
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  yearsList: number[] = []; 

  readonly ITEM_HEIGHT = 40;

  isLogModalOpen = false;
  selectedActivity: Activity | null = null;
  logForm = {
    name: '',
    description: '',
    duration: ''
  };

  allActivities: Activity[] = [];
  activityGroups: { dateLabel: string; activities: Activity[] }[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.generateYearsList();
    
    this.tempMonthIndex = this.selectedMonth.getMonth();
    this.tempYear = this.selectedMonth.getFullYear();

    this.allActivities = this.generateMockData();

    this.applyFilter();
  }

  generateMockData(): Activity[] {
    const today = new Date();
    
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    lastMonth.setDate(15); 

    return [
      {
        title: 'Running',
        description: 'Lari pagi keliling kompleks biar sehat.',
        tag: 'Cardio',
        time: '60 minutes',
        calories: '320 cal',
        progress: 0,
        status: 'active',
        date: today,
        logs: [],
        expanded: false
      },
      {
        title: 'Dancing',
        description: 'Latihan koreografi baru.',
        tag: 'Cardio',
        time: '60 minutes',
        calories: '250 cal',
        progress: 50,
        status: 'active',
        date: today,
        logs: [{ name: 'Sesi 1', description: 'Pemanasan', duration: '15 min' }],
        expanded: false
      },

      {
        title: 'Swimming',
        description: 'Berenang gaya bebas.',
        tag: 'Cardio',
        time: '45 minutes',
        calories: '200 cal',
        progress: 10,
        status: 'unfinished',
        date: yesterday,
        logs: [],
        expanded: false
      },

      {
        title: 'Gym Chest Day',
        description: 'Angkat beban fokus otot dada.',
        tag: 'Strength',
        time: '90 minutes',
        calories: '500 cal',
        progress: 100,
        status: 'active',
        date: twoDaysAgo,
        logs: [{ name: 'Set 1', description: 'Bench Press', duration: '15 min' }],
        expanded: false
      },

      {
        title: 'Marathon Training',
        description: 'Latihan lari jarak jauh bulan lalu.',
        tag: 'Endurance',
        time: '120 minutes',
        calories: '800 cal',
        progress: 100,
        status: 'active',
        date: lastMonth,
        logs: [],
        expanded: false
      }
    ];
  }

  generateYearsList() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
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

    if (monthContainer) {
        monthContainer.scrollTop = this.tempMonthIndex * this.ITEM_HEIGHT;
    }
    
    if (yearContainer) {
        const yearIndex = this.yearsList.indexOf(this.tempYear);
        if (yearIndex !== -1) {
            yearContainer.scrollTop = yearIndex * this.ITEM_HEIGHT;
        }
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
    const filteredData = this.allActivities.filter(item => {
      return item.date.getMonth() === this.selectedMonth.getMonth() &&
             item.date.getFullYear() === this.selectedMonth.getFullYear();
    });

    this.groupActivitiesByDate(filteredData);
  }

  groupActivitiesByDate(activities: Activity[]) {
    const groups: { [key: string]: Activity[] } = {};

    activities.forEach(item => {
      const dateKey = item.date.toDateString(); 
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });

    // Map ke struktur array untuk HTML
    this.activityGroups = sortedKeys.map(dateKey => {
      return {
        dateLabel: this.getRelativeLabel(new Date(dateKey)),
        activities: groups[dateKey]
      };
    });
  }

  getRelativeLabel(inputDate: Date): string {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    inputDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    yesterday.setHours(0,0,0,0);

    if (inputDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (inputDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      // Format tanggal biasa: "Mon, 08 Nov 2025"
      return inputDate.toLocaleDateString('en-GB', { 
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
      });
    }
  }

  openLogModal(item: Activity) {
    this.selectedActivity = item;
    // Reset form
    this.logForm = {
      name: '',
      description: '',
      duration: ''
    };
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
            duration: this.logForm.duration
        });
        
        if(this.selectedActivity.progress < 100) {
            this.selectedActivity.progress += 10;
        }
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