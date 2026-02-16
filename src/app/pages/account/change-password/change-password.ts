import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Wajib buat ngModel

@Component({
  selector: 'change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  oldPassword = '';
  newPassword = '';
  errorMessage = '';
  
  showOldPassword = false;
  showNewPassword = false;

  // State untuk Error
  oldPasswordError = false;
  newPasswordError = false;

  // DUMMY DATA: Anggap ini password asli user di database
  readonly mockDatabasePassword = 'user1234'; 

  toggleOldVisibility() {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  checkOldPassword() {
    if (!this.oldPassword) {
      this.oldPasswordError = false; 
      return;
    }

    // Jika kosong atau salah, nyalakan error
    if (!this.oldPassword || this.oldPassword !== this.mockDatabasePassword) {
      this.oldPasswordError = true;
    } else {
      this.oldPasswordError = false;
    }
  }

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
      this.errorMessage = 'Minimal 8 karakter, kombinasi huruf dan angka.'
    } 
    else if(this.newPassword === this.oldPassword){
      this.newPasswordError = true;
      this.errorMessage = 'Password baru tidak boleh sama dengan password lama'
    }
    else {
      this.newPasswordError = false;
    }
  }

  resetOldError() {
    this.oldPasswordError = false;
  }

  resetNewError() {
    this.newPasswordError = false;
  }

  // LOGIC TOMBOL SIMPAN (Validasi ulang buat jaga-jaga)
  get isFormValid(): boolean {
    // 1. Cek apakah Password Lama BENAR (Sama persis dgn DB)
    const isOldCorrect = this.oldPassword === this.mockDatabasePassword;
    
    // 2. Cek apakah Password Baru SESUAI REGEX
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    const isNewValid = passwordRegex.test(this.newPassword) && this.newPassword !== this.oldPassword;

    // Tombol hanya Valid (True) jika KEDUANYA True
    return isOldCorrect && isNewValid;
  }

  // --- LOGIC TOMBOL SIMPAN ---
  savePassword() {
    // Validasi ulang (Double check)
    if (!this.isFormValid) {
       return; // Stop kalau dipaksa klik lewat inspect element
    }

    alert('Berhasil disimpan! Password telah diganti.');
    // Panggil API backend di sini...
  }
}