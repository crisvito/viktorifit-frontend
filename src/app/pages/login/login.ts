import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/components';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [RouterModule, ButtonComponent, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPage {
  serverError: string = '';
  isLoading: boolean = false;
  dataLogin = {
      username: "",
      password: ""
    };
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  getErrorMessage(control: NgModel, label: string): string {
    if (this.serverError.includes('User not found')) {
      return 'Invalid Email/Username or Password';
    }

    if (this.serverError.includes('Account is not activated yet')) {
      return 'Please Activate Your Account First';
    }

    if (!control || !control.invalid || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      return `${label} field is required`;
    }

    return '';
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
      
        alert(`Selamat datang, ${response.user.fullname}!`);
        
        this.router.navigate(['/']); 
        
        this.isLoading = false;
      },
      error: (error) => {
        console.log(error);
        
        if (error.error && error.error.message) {
          this.serverError = error.error.message;
        }
        this.isLoading = false;
      }
    });
  }

}
