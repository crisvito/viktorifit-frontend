import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  step: 'email' | 'verify' | 'reset' | 'success' = 'email';
  isLoading = false;
  errorMessage = '';

  email = '';
  emailError = '';

  otp: string[] = ['', '', '', '', '', '']; 
  
  newPassword = '';
  oldPassword = 'user1234';
  confirmPassword = '';

  showNewPassword = false;
  showConfirmPassword = false;

  newPasswordError = false;
  confirmPasswordError = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  checkEmail() {
    if (!this.email) {
      this.emailError = 'Email is required.';
      return;
    }
    // Regex standar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Invalid email format.';
    } else {
      this.emailError = '';
    }
  }

  // Reset error pas user ngetik
  resetEmailError() {
    this.emailError = '';
  }

  get isEmailValid(): boolean {
    // Regex standar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Tombol hanya valid jika email tidak kosong DAN formatnya benar
    return this.email.length > 0 && emailRegex.test(this.email);
  }

  // Update submitEmail supaya lebih ringkas
  submitEmail() {
    if (!this.isEmailValid) return; // Double check

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.step = 'verify';
    }, 150);
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }
  
  onOtpInput(index: number, event: any) {
    const value = event.target.value;

    // 1. CEK APAKAH INI BUKAN ANGKA
    if (!/^\d+$/.test(value)) {
      // Reset Model (Data)
      this.otp[index] = ''; 
      
      // --- PERBAIKAN DISINI ---
      // Paksa reset Tampilan (DOM) secara manual
      event.target.value = ''; 
      return;
    }

    // 2. Jika angka, auto focus ke kotak selanjutnya
    if (value.length === 1 && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  onOtpKeyDown(index: number, event: KeyboardEvent) {
    // Backspace: Pindah ke kiri
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    // UBAH 2: Ambil 6 karakter saat paste
    const pastedData = event.clipboardData?.getData('text').slice(0, 6); 
    
    if (pastedData && /^\d+$/.test(pastedData)) {
      this.otp = pastedData.split('');
      
      // UBAH 3: Loop sampai 6
      while (this.otp.length < 6) this.otp.push('');
      
      setTimeout(() => {
        // UBAH 4: Max index adalah 5
        const lastIndex = Math.min(pastedData.length, 5);
        document.getElementById(`otp-${lastIndex}`)?.focus();
      }, 0);
    }
  }

  verifyCode() {
    this.isLoading = true;
    this.errorMessage = '';

    setTimeout(() => {
      const fullCode = this.otp.join('');
      
      // UBAH 5: Validasi 6 Digit
      if (fullCode === '123456') { 
        this.step = 'reset'; 
      } else {
        this.errorMessage = 'Incorrect Verification Code!';
        // Reset jadi 6 kotak kosong
        this.otp = ['', '', '', '', '', ''];
        document.getElementById('otp-0')?.focus();
      }
      this.isLoading = false;
    }, 100);
  }

  get isOtpFilled(): boolean {
    return this.otp.every(digit => digit.length === 1);
  }

  // ... (Logic Step 2 Password tetap sama) ...
  toggleNewVisibility() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }

  checkNewPassword() {
    // Kalau kosong, JANGAN error dulu
    if (!this.newPassword) {
      this.newPasswordError = false;
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    // Jika kosong atau tidak sesuai regex, nyalakan error
    if (!this.newPassword || !passwordRegex.test(this.newPassword)) {
      this.newPasswordError = true;
      this.errorMessage = 'Minimum 8 character, include alphabet and number'
    } 
    else if(this.newPassword === this.oldPassword){
      this.newPasswordError = true;
      this.errorMessage = 'New password can\'t be the same as old password';
    }
    else {
      this.newPasswordError = false;
    }
  }

  checkConfirmPassword(){
    if (!this.confirmPassword) {
      this.confirmPasswordError = false;
      return;
    }

    if(this.confirmPassword !== this.newPassword ){
      this.confirmPasswordError = true;
      // this.errorMessage = 'Password didn\'t match';
    }
  }

  resetNewError() {
    this.newPasswordError = false;
  }

  resetConfirmError() {
    this.confirmPasswordError = false;
  }

  get isPasswordValid(): boolean {
    // 1. Cek apakah Password Lama BENAR (Sama persis dgn DB)
    const isOldCorrect = this.newPassword === this.confirmPassword;

    // 2. Cek apakah Password Baru SESUAI REGEX
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isNewValid = passwordRegex.test(this.newPassword);

    // Tombol hanya Valid (True) jika KEDUANYA True
    return isOldCorrect && isNewValid;  
  }

  submitReset() {
    this.isLoading = true;
    setTimeout(() => {
      const from = this.route.snapshot.queryParams['from'];

      if (from === '/login') {
        this.router.navigate(['/login']);
      } else {
        this.router.navigate(['/profile/settings']);
      }
    }, 100);
  }
}