import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css'
})
export class OnboardingPage {

  formData = {
    gender: '',
    birthDate: '' as string | null,
    height: null as number | null,
    weight: null as number | null,
    symptoms: {
      diabetes: false,
      hypertension: false
    }
  };

  onBirthKey(event: KeyboardEvent, nextInput: HTMLInputElement | null) {
    if (event.key === 'Enter' || event.key === 'ArrowRight') {
      event.preventDefault();

      if (nextInput) {
        nextInput.focus();
      } else {
        // terakhir (YEAR) → validasi & lanjut step
        this.validateBirthDate();
        if (this.isBirthDateValid) {
          this.next();
        }
      }
    }
  }

  onBodyKey(event: KeyboardEvent, nextInput: HTMLInputElement | null) {
    if (event.key !== 'Enter' && event.key !== 'ArrowRight') return;

    event.preventDefault();

    if (nextInput) {
      nextInput.focus();
      return;
    }
  }



  steps = [
    { id: 1, key: 'gender' },
    { id: 2, key: 'birthdate' },
    { id: 3, key: 'body' },
    { id: 4, key: 'symptoms' }
  ];

  currentStep = 1;

  get totalSteps(): number {
    return this.steps.length;
  }

  selectedGender: 'male' | 'female' | null = null;


  selectGender(gender: 'male' | 'female') {
    this.selectedGender = gender;
    this.formData.gender = gender;
  }

  next() {
    if (this.currentStep < this.totalSteps && this.canContinue()) {
      this.currentStep++;
    }
  }


  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submit() {
    console.log(this.formData);
  }

  canContinue(): boolean {
    switch (this.currentStep) {

      case 1:
        return this.selectedGender !== null;

      case 2:
        return this.isBirthDateValid;

      case 3:
        return this.isBodyValid();
      
      case 4:
        return true;

      default:
        return false;
    }
  }

  birthDay: number | null = null;
  birthMonth: number | null = null;
  birthYear: number | null = null;

  isBirthDateValid = false;
  birthDateError = '';

  syncDate() {
    if (this.birthDay && this.birthMonth && this.birthYear) {
      const day = String(this.birthDay).padStart(2, '0');
      const month = String(this.birthMonth).padStart(2, '0');
      this.formData.birthDate = `${this.birthYear}-${month}-${day}`;
      this.validateBirthDate();
    }
  }

  onCalendarChange(event: any) {
    const date = new Date(event.target.value);
    this.birthDay = date.getDate();
    this.birthMonth = date.getMonth() + 1;
    this.birthYear = date.getFullYear();
    this.formData.birthDate = event.target.value;
    this.validateBirthDate();
  }

  validateBirthDate() {
    if (
      this.birthDay === null ||
      this.birthMonth === null ||
      this.birthYear === null
    ) {
      this.isBirthDateValid = false;
      this.birthDateError = '';
      return;
    }

    const day = Number(this.birthDay);
    const month = Number(this.birthMonth);
    const year = Number(this.birthYear);

    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      year < 1900 ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      this.isBirthDateValid = false;
      this.birthDateError = 'Invalid date';
      return;
    }

    if (date > today) {
      this.isBirthDateValid = false;
      this.birthDateError = 'Birth date cannot be in the future';
      return;
    }

    this.isBirthDateValid = true;
    this.birthDateError = '';

    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    this.formData.birthDate = `${year}-${m}-${d}`;
  }

    get isHeightValid(): boolean {
    return (
      this.formData.height !== null &&
      this.formData.height >= 50 &&
      this.formData.height <= 250
    );
  }

  get isWeightValid(): boolean {
    return (
      this.formData.weight !== null &&
      this.formData.weight >= 20 &&
      this.formData.weight <= 300
    );
  }

  isBodyValid(): boolean {
    const h = this.formData.height;
    const w = this.formData.weight;

    if (h === null || w === null) return false;
    if (h < 50 || h > 250) return false;
    if (w < 20 || w > 300) return false;

    return true;
  }

  

  get selectedCondition(): string[] {
    return Object.keys(this.formData.symptoms)
      .filter(key => this.formData.symptoms[key as 'diabetes' | 'hypertension']);
  } 

  selectCondition(condition: 'diabetes' | 'hypertension') {
    this.formData.symptoms[condition] =
      !this.formData.symptoms[condition];
  }

}
