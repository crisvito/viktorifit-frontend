import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html',
})
export class Feedback {

  constructor(private router: Router) {}

  // --- STATE ---
  isProfileOpen = false;
  searchText: string = '';
  rowsDisplay: any = 5;

  // --- MODAL STATE ---
  isModalOpen = false;
  isViewModalOpen = false;
  selectedFeedback: any = null;

  // Form State
  newUser = '';
  newEmail = '';
  newMessage = '';
  newStatus = 'Pending';

  // State untuk melacak dropdown status yang terbuka
  openDropdownIndex: number = -1; 

  // --- ACTIONS ---
  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  logout() {
    this.router.navigate(['/login']);
  }

  setRows(count: number | 'All') {
    this.rowsDisplay = count;
  }

  // --- DROPDOWN STATUS LOGIC ---
  
  toggleStatusDropdown(index: number, event: Event) {
    event.stopPropagation(); // Mencegah klik tembus ke baris tabel
    
    if (this.openDropdownIndex === index) {
      this.openDropdownIndex = -1; // Tutup jika sudah terbuka
    } else {
      this.openDropdownIndex = index; // Buka yang diklik
    }
  }

  updateStatus(item: any, newStatus: string) {
    item.status = newStatus;
    this.openDropdownIndex = -1; // Tutup dropdown setelah memilih
  }

  // [FUNGSI INI YANG KURANG TADI]
  closeAllDropdowns() {
    this.openDropdownIndex = -1;
  }

  // --- MODAL LOGIC ---
  openModal() {
    this.isModalOpen = true;
    this.newUser = '';
    this.newEmail = '';
    this.newMessage = '';
    this.newStatus = 'Pending';
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveFeedback() {
    if (this.newUser.trim() && this.newEmail.trim() && this.newMessage.trim()) {
      this.feedbackList.unshift({
        user: this.newUser,
        email: this.newEmail,
        message: this.newMessage,
        status: this.newStatus
      });
      this.closeModal();
    } else {
      alert("Please fill in all fields!");
    }
  }

  viewFeedback(item: any) {
    this.selectedFeedback = item;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedFeedback = null;
  }
  
  // --- DATA DUMMY ---
  feedbackList = [
    { user: 'Jonathan Maxwell', email: 'j.maxwell@example.com', message: 'The AI-generated workout plan is great...', status: 'Resolved' },
    { user: 'Katherine Rosebud', email: 'katherine.r@example.com', message: 'Requesting a synchronization feature...', status: 'In Progress' },
    { user: 'Leonard Richardson', email: 'leo.rich@example.com', message: 'Interface consistently lags...', status: 'In Progress' },
    { user: 'Samantha Miller', email: 'sam.miller@example.com', message: 'Video tutorials missing audio...', status: 'Pending' },
    { user: 'David Harrison', email: 'd.harrison@example.com', message: 'Dark mode UI contrast issues...', status: 'Resolved' },
    { user: 'Emily Thompson', email: 'emily.t@example.com', message: 'Export progress reports as PDF...', status: 'Dismiss' },
  ];

  get filteredData() {
    let data = this.feedbackList.filter(item => {
      const term = this.searchText.toLowerCase();
      return item.user.toLowerCase().includes(term) || 
             item.email.toLowerCase().includes(term) ||
             item.message.toLowerCase().includes(term);
    });

    if (this.rowsDisplay === 'All') {
      return data;
    } else {
      return data.slice(0, this.rowsDisplay);
    }
  }
}