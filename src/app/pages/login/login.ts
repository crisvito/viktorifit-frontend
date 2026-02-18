import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ButtonComponent, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  @ViewChild('loginForm') loginForm!: NgForm;

  showActivationModal: boolean = false;
  activationMessage: string = '';
  serverError: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  dataLogin = {
      username: "",
      password: ""
    };
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

@HostListener('document:keydown.enter')
  handleEnterKey() {
    if (this.loginForm) {
      this.onLogin(this.loginForm);
    }
  }

  getErrorMessage(control: NgModel, label: string): string {
    if (this.serverError.includes('User not found') || this.serverError.includes('Invalid')) {
      return 'Invalid Email/Username or Password';
    }

    if (this.serverError.includes('Account is not activated yet')) {
      this.showActivationModal = true;
      this.activationMessage = 'Your account is not activated yet. Please check your email to activate your account.';
    }

    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      return `${label} field is required`;
    }

    return this.serverError;
  }

  onLogin(form: NgForm) {
    if (this.isLoading) return;

    if (form.invalid) {
      form.control.markAllAsTouched(); 
      return;
    }

    this.isLoading = true;

    this.authService.login(this.dataLogin).subscribe({
      next: (response) => {
  
        this.authService.saveSession(response.token, response.user);
        
        this.router.navigate(['/dashboard']); 
        
        this.isLoading = false;
      },
      error: (error) => {
        
        if (error.error && error.error.message) {
          this.serverError = error.error.message;
        }
        this.isLoading = false;
      }
    });
  }

  closeActivationModal() {
    this.showActivationModal = false;
    this.serverError = '';
  }
  
  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
