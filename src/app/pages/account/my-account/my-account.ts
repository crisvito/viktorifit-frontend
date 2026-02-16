import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dob: string;
}

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-account.html',
})
export class MyAccount implements OnInit {

  userData: UserProfile = {
    name: '',
    email: '',
    phone: '',
    dob: ''
  };

  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  // Simulasi ambil data dari backend
  loadData() {
    setTimeout(() => {
      this.userData = {
        name: 'Cris Vito',
        email: 'cris@example.com',
        phone: '08123456789',
        dob: '2000-01-01'
      };
      this.isLoading = false;
    }, 800); // delay biar keliatan loading
  }

  // Simulasi save ke backend
  saveChanges() {
    console.log('Saved data:', this.userData);
    alert('Changes Saved!');
  }
}
