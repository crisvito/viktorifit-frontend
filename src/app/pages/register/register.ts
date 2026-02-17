import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components';
import { AuthService } from '../../core';
import { FormsModule, NgModel, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, ButtonComponent, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterPage {
  serverError: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  isTermsAccepted: boolean = false; 
  termsError: boolean = false; 

  confirmPassword: string = "";
  dataRegister = {
    fullname: "",
    username: "",
    email: "",
    password: ""
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  getErrorMessage(control: NgModel, label: string): string {
    // 1. Prioritas Utama: Cek Error dari Backend (Case Insensitive)
    const lowerServerError = this.serverError.toLowerCase();
    const lowerLabel = label.toLowerCase();

    // Jika ada pesan dari server dan mengandung kata label (misal 'email' atau 'username')
    if (this.serverError && lowerServerError.includes(lowerLabel)) {
      return this.serverError; 
    }

    // 2. Validasi Client-side (Required, Pattern, dll)
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }
    
    if (control.hasError('required')) return `${label} field is required`;
    if (control.hasError('minlength')) return `${label} must be at least 8 characters`;
    if (control.hasError('pattern')) {
      return label === 'Email' ? 'Please enter a valid email address' : 'Password must contain a symbol';
    }

    return `${label} field is required`;
  }

  getConfirmPasswordError(control: NgModel): string {
    if (!control || !(control.touched || control.dirty)) return '';
    if (this.confirmPassword !== this.dataRegister.password) {
      return 'Password does not match';
    }
    return '';
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onRegister(form: NgForm) {
    this.serverError = ''; // Reset error setiap klik register
    this.termsError = false;
    
    if (this.isLoading) return;

    // Trigger touched agar error client-side muncul
    if (form.invalid) {
      form.control.markAllAsTouched(); 
      return;
    }

    // Cek Terms and Use
    if (!this.isTermsAccepted) {
      this.termsError = true;
      return;
    }

    this.isLoading = true;

    this.authService.register(this.dataRegister).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/login']); 
      },
      error: (error) => {
        this.isLoading = false;
        
        // Handle Error 400 (Bad Request) atau 409 (Conflict) dari Backend
        if (error.status === 400 || error.status === 409) {
          this.serverError = error.error?.message || "Registration failed";
        } else {
          this.serverError = "Connection error. Please try again.";
        }
      }
    });
  }
}