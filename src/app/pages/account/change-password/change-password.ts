import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms'; // Penting: Import NgForm & NgModel
import { Router } from '@angular/router';
import { AuthService } from '../../../core';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  isLoading = false;

  // Toggle Visibility
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Data Model
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmationPassword: ''
  };

  // Toast State
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(private authService: AuthService, private router: Router) {}

  // --- VALIDATION LOGIC (Mirip Register) ---
  
  getErrorMessage(control: NgModel, label: string): string {
    // Cek jika control belum disentuh/kotor, jangan tampilkan error dulu
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }
    
    if (control.hasError('required')) {
      return `${label} field is required`;
    }
    
    // Validasi panjang minimal 8 (Sesuai Register)
    if (control.hasError('minlength')) {
      return `${label} Must be at least 8 chars with a symbol (e.g. -, *, /)`;
    }

    return '';
  }

  getConfirmPasswordError(control: NgModel): string {
    if (!control || !(control.touched || control.dirty)) return '';
    
    if (this.passwordData.confirmationPassword !== this.passwordData.newPassword) {
      return 'Password does not match';
    }

    return '';
  }

  // --- VISIBILITY TOGGLES ---
  toggleCurrentPassword() { this.showCurrentPassword = !this.showCurrentPassword; }
  toggleNewPassword() { this.showNewPassword = !this.showNewPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  // --- SUBMIT ACTION ---
  save(form: NgForm) {
    // 1. Cek Validasi Form Angular (Required & Minlength)
    if (form.invalid) {
      form.control.markAllAsTouched(); // Trigger semua pesan error merah
      return;
    }

    // 2. Cek Manual Match Password
    if (this.passwordData.newPassword !== this.passwordData.confirmationPassword) {
      this.triggerToast('Password confirmation does not match', 'error');
      return;
    }

    this.isLoading = true;

    // 3. Panggil API
    this.authService.changePassword(this.passwordData).subscribe({
      next: (responseMessage) => {
        this.isLoading = false;
        // Tampilkan pesan sukses dari backend atau default
        const msg = typeof responseMessage === 'string' ? responseMessage : 'Password changed successfully!';
        this.triggerToast(msg, 'success');
        
        this.router.navigate(['/profile/settings'])
      },
      error: (err) => {
        this.isLoading = false;
        
        // Parsing error message supaya rapi
        let message = 'Failed to change password';
        if (err.error && typeof err.error === 'object' && err.error.message) {
          message = err.error.message;
        } else if (typeof err.error === 'string') {
          // Kadang error string JSON
          try {
            const parsed = JSON.parse(err.error);
            message = parsed.message || message;
          } catch (e) {
            message = err.error;
          }
        }
        
        this.triggerToast(message, 'error');
      }
    });
  }

  triggerToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3000);
  }
}