import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '../../shared/components';
import { AuthService } from '../../core';
import { FormsModule, NgModel, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true, // Pastikan standalone true jika menggunakan imports
  imports: [RouterModule, ButtonComponent, FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterPage {
  serverError: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  // --- TAMBAHAN BARU ---
  isTermsAccepted: boolean = false; // Untuk binding checkbox
  termsError: boolean = false;      // Untuk status error visual
  // ---------------------

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
    if (label == 'Username' && this.serverError.includes('Username')) {
      return this.serverError;
    }
    if (label == 'Email' && this.serverError.includes('Email')) {
      return this.serverError;
    }
    
    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }
    
    if (control.hasError('required')) return `${label} field is required`;
    if (control.hasError('minlength')) return `${label} Must be at least 8 chars`; // Sederhanakan pesan jika perlu
    if (control.hasError('pattern')) return `Please enter a valid email address `;

    return `${label} field is required`;
  }

  getConfirmPasswordError(control: NgModel): string {
    if (!control || !(control.touched || control.dirty)) return '';
    if (this.confirmPassword !== this.dataRegister.password) {
      return 'Password does not match';
    }
    return '';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister(form: NgForm) {
    this.serverError = '';
    this.termsError = false; // Reset error terms setiap kali tombol ditekan
    
    if (this.isLoading) return;

    if (form.invalid) {
      form.control.markAllAsTouched(); 
      return;
    }

    // --- LOGIC VALIDASI TERMS ---
    // Cek apakah checkbox dicentang
    if (!this.isTermsAccepted) {
      this.termsError = true; // Munculkan error merah
      return; // Stop proses register
    }
    // ---------------------------


    this.isLoading = true;

    this.authService.register(this.dataRegister).subscribe({
      next: (response) => {
        this.router.navigate(['/login']); 
        this.isLoading = false;
      },
      error: (error) => {
        if (error.error && error.error.message) {
          this.serverError = error.error.message;
        } else {
            this.serverError = "Registration failed. Please try again.";
        }
        this.isLoading = false;
      }
    });
  }
}