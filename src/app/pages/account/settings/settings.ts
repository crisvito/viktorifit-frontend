import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// 1. DEFINISI TIPE DATA (INTERFACE)
// Tanda tanya (?) artinya properti ini boleh kosong/tidak ada
interface SettingsItem {
  type: 'text' | 'info' | 'toggle' | 'link' | 'value'; 
  label?: string;       // Judul menu (misal: Push Notification)
  content?: string;     // Isi teks panjang (misal: Deskripsi)
  value?: any;          // Nilai (misal: "English" atau true/false)
  icon?: string;        // Nama icon
  danger?: boolean;     // Penanda warna merah (Opsional)
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
  
  // 2. DATA SETTING (SESUAI REQUEST)
  menuGroups: SettingsGroup[] = [
    {
      title: 'About Us',
      items: [
        { 
          type: 'info', 
          label: 'Developer', 
          value: 'VIKTORIA TEAM', 
          icon: 'code' 
        },
        { 
          type: 'text', 
          content: 'ViktoriFit adalah teman latihan pribadimu. Dirancang untuk membantu mencapai target kebugaran dengan panduan latihan yang terstruktur dan pelacakan progres yang akurat.' 
        }
      ]
    },
    {
      title: 'Privacy Policy',
      items: [
        { 
          type: 'text', 
          content: 'Data Anda aman bersama kami. ViktoriFit hanya menyimpan data latihan secara lokal di perangkat Anda dan tidak membagikannya ke pihak ketiga tanpa izin.' 
        }
      ]
    },
    {
      title: 'Preference',
      items: [
        // { 
        //   type: 'toggle', 
        //   label: 'Push Notifications', 
        //   icon: 'bell', 
        //   value: true // Default On
        // },
        { 
          type: 'value', 
          label: 'Language', 
          icon: 'globe', 
          value: 'English' // Static Text
        }
      ]
    },
    {
      title: 'Privacy & Security',
      items: [
        { 
          type: 'link', 
          label: 'Change Password', 
          icon: 'lock' 
        }
      ]
    },
    {
      title: 'Danger Zone',
      items: [
        { 
          type: 'link', 
          label: 'Log Out', 
          icon: 'log-out', 
          danger: false 
        },
        { 
          type: 'link', 
          label: 'Delete Account', 
          icon: 'trash', 
          danger: true
        }
      ]
    }
  ];

  showLogoutModal = false;
  showDeleteModal = false;
  
  constructor(private router: Router) {}

  // Function dummy buat handle klik
  handleAction(item: SettingsItem) {
   if (item.label === 'Log Out') {
      this.showLogoutModal = true; // Buka Modal Logout
    } 
    else if (item.label === 'Delete Account') {
      this.showDeleteModal = true; // Buka Modal Delete
    }
    // Handle link lain (misal change password atau toggle)
    // else if (item.type === 'toggle') {
    //   item.value = !item.value; // Ganti status toggle
    // }
    else if ( item.label === 'Change Password'){
      this.router.navigate(['/profile/change-password']);
    }
  }

  confirmLogout() {
    console.log('User logged out');
    this.showLogoutModal = false;
    this.router.navigate(['/login']); // Redirect ke halaman login
  }

  confirmDelete() {
    console.log('Account deleted');
    this.showDeleteModal = false;
    // Panggil API hapus akun disini...
    this.router.navigate(['/register']); // Redirect ke awal
  }

  // 4. TUTUP MODAL (BATAL)
  closeModals() {
    this.showLogoutModal = false;
    this.showDeleteModal = false;
  }

}