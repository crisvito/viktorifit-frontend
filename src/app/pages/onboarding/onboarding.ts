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
    },
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
    { id: 4, key: 'symptoms' },
    { id: 5, key: 'goal' },
    { id: 6, key: 'workoutDuration' },
    { id: 7, key: 'workoutDay' }
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



  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  submit() {
    console.log(this.formData);
  }

// --- VARIABLES ---
  birthDay: number | null = null;
  birthMonth: number | null = null;
  birthYear: number | null = null;

  isBirthDateValid = false;

  // --- HELPER: HITUNG MAX HARI ---
  // Mengembalikan jumlah hari dalam bulan tertentu (28/29/30/31)
  getMaxDays(month: number | null, year: number | null): number {
    if (!month) return 31; // Default max 31 jika bulan belum diisi

    // Jika tahun belum diisi, kita anggap tahun kabisat (2024).
    // Kenapa? Supaya user BISA ngetik tanggal 29 Februari DULUAN sebelum ngetik tahunnya.
    const y = year || 2024;

    // Trik JS: Tanggal ke-0 bulan depan adalah tanggal terakhir bulan ini.
    return new Date(y, month, 0).getDate();
  }

  // --- INPUT HANDLERS (VALIDASI) ---

// --- INPUT HANDLERS (SMART AUTO-ZERO) ---

  // 1. Validasi Hari
  validateDay(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');

    if (val) {
      let num = parseInt(val, 10);
      const maxDays = this.getMaxDays(this.birthMonth, this.birthYear);

      // Cek digit pertama: Kalau ngetik 4, 5, 6, 7, 8, 9 -> Otomatis jadi 04, 05...
      if (val.length === 1 && num > 3) {
        val = '0' + val;
      }

      // Cek Max Hari (30/31/28)
      if (parseInt(val, 10) > maxDays) {
        val = val.slice(0, -1); // Batalkan ketikan terakhir jika kelebihan
      }
    }

    input.value = val;
    this.birthDay = val ? parseInt(val, 10) : null;
    this.syncDate();
  }

  // 2. Validasi Bulan
  validateMonth(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');

    if (val) {
      let num = parseInt(val, 10);

      // Cek digit pertama: Kalau ngetik 2 s/d 9 -> Otomatis jadi 02, 09...
      // (Karena bulan gak mungkin 20, 30, dst. Jadi digit pertama > 1 pasti maksudnya 02-09)
      if (val.length === 1 && num > 1) {
        val = '0' + val;
      }

      // Cek Max Bulan (12)
      if (parseInt(val, 10) > 12) {
        val = val.slice(0, -1);
      }
    }

    input.value = val;
    this.birthMonth = val ? parseInt(val, 10) : null;

    // LOGIC PENYESUAIAN HARI (Agar tanggal 31 gak error pas pilih Feb)
    if (this.birthDay) {
      const maxDays = this.getMaxDays(this.birthMonth, this.birthYear);
      if (this.birthDay > maxDays) {
        this.birthDay = maxDays; // Otomatis turunin tanggal (31 -> 29/28)
      }
    }

    this.syncDate();
  }
// 3. Validasi Tahun (Strict: 1900 - 2014)
  validateYear(event: any) {
    const input = event.target;
    let val = input.value.replace(/[^0-9]/g, '');

    // Max 4 digit
    if (val.length > 4) val = val.slice(0, 4);

    if (val) {
      // RULE 1: Digit Pertama cuma boleh '1' atau '2'
      if (val.length >= 1) {
        const d1 = val[0];
        if (d1 !== '1' && d1 !== '2') {
           val = ''; 
        }
      }

      // RULE 2: Digit Kedua (Century)
      if (val.length >= 2) {
        const d1 = val[0];
        const d2 = val[1];

        // 19xx
        if (d1 === '1' && d2 !== '9') val = val.slice(0, -1);
        
        // 20xx
        if (d1 === '2' && d2 !== '0') val = val.slice(0, -1);
      }

      // RULE 3: Digit Ketiga (Khusus tahun 20xx)
      // Kita harus memblokir 202x, 203x, dst karena max 2014.
      if (val.length >= 3) {
        if (val.startsWith('20')) {
            const d3 = val[2];
            // Digit ketiga cuma boleh '0' (200x) atau '1' (201x)
            if (d3 !== '0' && d3 !== '1') {
                val = val.slice(0, -1);
            }
        }
      }

      // RULE 4: Digit Keempat (Hard Limit 2015)
      if (val.length === 4) {
         const num = parseInt(val, 10);
         // Jika >= 2015, hapus digit terakhir
         if (num >= 2015) {
             val = val.slice(0, -1);
         }
      }
    }

    // Update Input
    input.value = val;
    this.birthYear = val ? parseInt(val, 10) : null;

    // Logic Kabisat (Auto Adjust Day)
    if (this.birthDay && this.birthMonth === 2 && val.length === 4) {
       const maxDays = this.getMaxDays(this.birthMonth, this.birthYear);
       if (this.birthDay > maxDays) {
         this.birthDay = maxDays;
       }
    }

    this.syncDate();
  }

  // --- NAVIGATION (ARROW KEY & AUTO NEXT) ---
  onBirthKey(event: KeyboardEvent, nextInput?: HTMLInputElement) {
    const input = event.target as HTMLInputElement;
    const val = input.value;

    // 1. Arrow Right -> Pindah Kanan
    if (event.key === 'ArrowRight' && nextInput) {
        nextInput.focus();
        return;
    }

    // 2. Jika digit penuh (2 digit) -> Pindah Kanan Otomatis
    // Kita cek key-nya bukan Backspace/Delete biar enak ngapusnya
    if (val.length === input.maxLength && nextInput && event.key !== 'Backspace') {
        nextInput.focus();
    }
  }

  // --- FINAL CHECK (UNTUK TOMBOL CONTINUE) ---
  syncDate() {
    if (this.birthDay && this.birthMonth && this.birthYear) {
      const d = String(this.birthDay).padStart(2, '0');
      const m = String(this.birthMonth).padStart(2, '0');
      this.formData.birthDate = `${this.birthYear}-${m}-${d}`;

      // Validasi Range Tahun (1900 - 2015)
      // Tombol Continue hanya nyala jika ini true
      if (this.birthYear <= 1900 || this.birthYear >= 2015) {
        this.isBirthDateValid = false;
      } else {
        this.isBirthDateValid = true;
      }
    } else {
      this.isBirthDateValid = false;
    }
  }



  onCalendarChange(event: any) {
    const value = event.target.value;
    if (!value) return;

    const date = new Date(value);
    
    this.birthDay = date.getDate();
    this.birthMonth = date.getMonth() + 1;
    this.birthYear = date.getFullYear();
    
    this.formData.birthDate = value;
    this.validateBirthDate();
  }

  validateBirthDate() {
    if (!this.birthDay || !this.birthMonth || !this.birthYear) {
      this.isBirthDateValid = false;
      return;
    }

    const day = Number(this.birthDay);
    const month = Number(this.birthMonth);
    const year = Number(this.birthYear);

    const date = new Date(year, month - 1, day);
    
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      this.isBirthDateValid = false;
      return;
    }

    if (year <= 1900 || year >= 2015) {
      this.isBirthDateValid = false;
      return;
    }

    this.isBirthDateValid = true;
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

    workoutDays: WorkoutDay[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  next() {
    if (this.canContinue()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      } else {
        // Jika sudah di step 7, maka simpan data
        this.submit();
      }
    }
  }

  selectedGoal: 'gain' | 'loss' | null = null;

  selectGoal(value: 'gain' | 'loss') {
    this.selectedGoal = value;
    this.formData.goal = value;
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
        return this.selectedGender !== null;
      case 2:
        return this.isBirthDateValid;
      case 3:
        return this.isBodyValid();
      case 4:
        return true;
      case 5:
        return this.selectedGoal !== null;
      case 6:
        return this.isWorkoutDurationValid();
      case 7:
        return this.hasSelectedDay();
      case 8:
        return this.selectedGoal !== null;
      case 9:
        return this.isWorkoutDurationValid();   
      case 10:
        return this.hasSelectedDay();    
      default:
        return false;
    }
  }
}
