import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarComponent } from '../../shared/components/calendar.component/calendar.component'; 

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalendarComponent], 
  templateUrl: './schedule.html',
})
export class Schedule implements OnInit {

  isModeOpen = false;
  selectedMode = 'Home';
  isLogModalOpen = false;
  
  logForm = {
    name: '',
    description: '',
    duration: ''
  };

  selectedActivityIndex: number = -1;

  homeData: any[] = [];
  gymData: any[] = [];
  activities: any[] = [];

  ngOnInit() {
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
  }


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

    if (!activity.logs) {
      activity.logs = [];
    }

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

  currentDate: Date = new Date();

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