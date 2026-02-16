import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core';

// 1. DEFINISI TIPE DATA (INTERFACE)
interface SettingsItem {
  type: 'text' | 'info' | 'toggle' | 'link' | 'value'; 
  label?: string;       
  content?: string;     
  value?: any;          
  icon?: string;        
  danger?: boolean;     
}

interface SettingsGroup {
  title: string;
  items: SettingsItem[];
}

@Component({
  selector: 'settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings {
  
  // State untuk Loading dan Modal
  isLoading = false;
  showLogoutModal = false;
  showDeleteModal = false;

  // State untuk Toast (Pengganti Alert)
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // 2. DATA SETTING
  menuGroups: SettingsGroup[] = [
    {
      title: 'About Us',
      items: [
        { type: 'info', label: 'Developer', value: 'VIKTORIA TEAM', icon: 'code' },
        { type: 'text', content: 'ViktoriFit adalah teman latihan pribadimu. Dirancang untuk membantu mencapai target kebugaran dengan panduan latihan yang terstruktur dan pelacakan progres yang akurat.' }
      ]
    },
    {
      title: 'Privacy Policy',
      items: [
        { type: 'text', content: 'Data Anda aman bersama kami. ViktoriFit hanya menyimpan data latihan secara lokal di perangkat Anda dan tidak membagikannya ke pihak ketiga tanpa izin.' }
      ]
    },
    {
      title: 'Preference',
      items: [
        { type: 'value', label: 'Language', icon: 'globe', value: 'English' }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { type: 'link', label: 'Change Password', icon: 'lock' }
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        { type: 'link', label: 'Log Out', icon: 'log-out', danger: false },
        { type: 'link', label: 'Delete Account', icon: 'trash', danger: true }
      ]
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  // Handle klik menu
  handleAction(item: SettingsItem) {
   if (item.label === 'Log Out') {
      this.showLogoutModal = true;
    } 
    else if (item.label === 'Delete Account') {
      this.showDeleteModal = true;
    }
    else if ( item.label === 'Change Password'){
      this.router.navigate(['/profile/change-password']);
    }
  }

  // --- LOGIC HAPUS AKUN ---
  confirmDelete() {
    if (this.isLoading) return;
    this.isLoading = true;

    // Panggil fungsi dari AuthService
    this.authService.deleteAccount().subscribe({
      next: () => {
        // 1. Bersihkan sesi lokal
        this.authService.logout(); 
        
        // 2. Tutup modal & Reset loading
        this.closeModals();
        this.isLoading = false;

        // 3. Redirect ke halaman Register (karena akun sudah hilang)
        this.router.navigate(['/register']);
      },  
      error: (err) => {
        this.isLoading = false;
        this.closeModals();
        // Tampilkan error pakai Toast, bukan Alert
        this.triggerToast(err.error?.message || 'Failed to delete account', 'error');
      }
    });
  }

  // --- LOGIC LOGOUT ---
  confirmLogout() {
    this.authService.logout(); 
    this.closeModals();
    this.router.navigate(['/login']);
  }

  closeModals() {
    this.showLogoutModal = false;
    this.showDeleteModal = false;
  }

  // --- HELPER UNTUK TOAST ---
  triggerToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    // Hilang otomatis setelah 3 detik
    setTimeout(() => this.showToast = false, 3000);
  }
}