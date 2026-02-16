import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-account.html',
})
export class MyAccount implements OnInit {
  userData = {
    name: '',
    email: '',
    username: ''
  };

  isLoading = true;

  constructor(
    private authService: AuthService, 
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.getUser();
    if (user) {
      this.userData.name = user.fullname;
      this.userData.email = user.email;
      this.userData.username = user.username;
    }
    this.isLoading = false;
  }

  // Tambahkan variabel ini di dalam class
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // Fungsi helper untuk memicu toast
  triggerToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Sembunyikan setelah 3 detik
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  // Update fungsi saveChanges kamu
  saveChanges() {
  this.isLoading = true;

  const payload = {
    fullname: this.userData.name,
    username: this.userData.username,
    email: this.userData.email 
  };

  this.http.put(`${environment.apiUrl}auth/update-account`, payload).subscribe({
    next: (res: any) => {
      // 1. Update ke Storage & Beritahu aplikasi (lewat Service)
      this.authService.updateUserOnly(res);

      // 2. PENTING: Update variabel lokal agar tampilan langsung berubah
      this.userData.name = res.fullname;
      this.userData.username = res.username;
      
      this.triggerToast('Changes saved and updated!', 'success');
      this.isLoading = false;
    },
    error: (err) => {
      this.triggerToast(err.error?.message || 'Update failed', 'error');
      this.loadData();
      this.isLoading = false;
    }
  });
}
}