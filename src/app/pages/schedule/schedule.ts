import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type WorkoutDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})

export class SchedulePage {
  formData = {
    goal: '',
    workoutDuration: null as number | null,
    workoutDay: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    }
  };

  workoutDays: WorkoutDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  steps = [
    { id: 1, key: 'goal' },
    { id: 2, key: 'workoutDuration' },
    { id: 3, key: 'workoutDay' }
  ];

  currentStep = 1;

  get totalSteps(): number {
    return this.steps.length;
  }

  next() {
    if (this.currentStep < this.totalSteps && this.canContinue()) {
      this.currentStep++;
    }
  }

  selectedGoal: 'gain' | 'loss' | null = null;

  selectGoal(value: 'gain' | 'loss') {
    this.selectedGoal = value;
  }

  isWorkoutDurationValid(): boolean {
    const duration = this.formData.workoutDuration;
    return duration !== null && duration >= 15 && duration <= 150;
  }

  selectDay(day: WorkoutDay) {
    this.formData.workoutDay[day] =
      !this.formData.workoutDay[day];
  }

  get selectedDay(): WorkoutDay[] {
    return (Object.keys(this.formData.workoutDay) as WorkoutDay[])
      .filter(day => this.formData.workoutDay[day]);
  }

  hasSelectedDay(): boolean {
    return this.selectedDay.length > 0;
  }


  canContinue(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.selectedGoal !== null;
      case 2:
        return this.isWorkoutDurationValid();
      case 3:
        return this.hasSelectedDay();
      default:
        return false;
    }
  }
}
