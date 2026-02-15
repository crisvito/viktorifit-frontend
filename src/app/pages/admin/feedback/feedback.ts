import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, inquiryService } from '../../../core'; 

// ====== INTERFACES ======
interface InquiryBackend {
  id: number;
  name: string;
  email: string;
  description: string;
  isResolved: boolean; // Sesuai JSON Backend
  createdAt: string;
}

export interface Feedback {
  id: number;
  user: string;
  email: string;
  message: string;
  status: 'Resolved' | 'Not Resolved';
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html',
})
export class FeedbackPage implements OnInit {

  // ====== DATA STATE ======
  data: Feedback[] = [];
  filteredData: Feedback[] = [];
  selectedFeedback: Feedback | null = null;
  isLoading = false;

  // ====== NOTIFICATION (Pengganti Alert) ======
  notifMessage: string = '';
  notifType: 'success' | 'error' | '' = '';
  showNotif: boolean = false;

  // ====== PAGINATION ======
  currentPage: number = 1;
  rowsDisplay: number | 'All' = 5;

  // ====== UI STATE ======
  searchText: string = '';
  isViewModalOpen = false;
  isProfileOpen = false;
  isLogoutModalOpen = false;

  // ====== DELETE STATE ======
  isDeleteConfirmOpen = false;
  deleteTarget: Feedback | null = null;

  // ====== STATUS ACTIONS STATE ======
  openDropdownIndex: number = -1;
  isConfirmStatusOpen = false;
  pendingStatus: Feedback['status'] | null = null;
  pendingFeedback: Feedback | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private inquiryService: inquiryService
  ) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  // ====== LOAD DATA ======
  loadFeedback() {
    this.isLoading = true;
    this.inquiryService.getInquiries().subscribe({
      next: (res: any[]) => {
        // Mapping Backend (isResolved) -> Frontend (Status String)
        this.data = res.map((item: InquiryBackend) => ({
          id: item.id,
          user: item.name,
          email: item.email,
          message: item.description,
          status: item.isResolved ? 'Resolved' : 'Not Resolved'
        }));

        this.applyFilter(); // Filter ulang & reset pagination
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.showNotification('Failed to load feedback data', 'error');
        this.isLoading = false;
      }
    });
  }

  // ====== NOTIFICATION SYSTEM ======
  showNotification(message: string, type: 'success' | 'error') {
    this.notifMessage = message;
    this.notifType = type;
    this.showNotif = true;

    setTimeout(() => {
      this.showNotif = false;
    }, 3000); // Hilang dalam 3 detik
  }

  // ====== FILTER & SEARCH ======
  applyFilter() {
    const keyword = this.searchText.toLowerCase().trim();

    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(item =>
        item.user.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.message.toLowerCase().includes(keyword)
      );
    }

    this.currentPage = 1; // Reset ke halaman 1 setiap kali filter berubah
  }

  onSearchChange() {
    this.applyFilter();
  }

  deleteFeedback(item: Feedback, event: Event) {
    event.stopPropagation(); // Biar gak kebuka modal View Detail
    this.deleteTarget = item;
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteConfirmOpen = false;
    this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;

    const id = this.deleteTarget.id;

    this.inquiryService.removeInquiry(id).subscribe({
      next: () => {
        // Hapus dari UI Local biar cepat hilang tanpa reload
        this.data = this.data.filter(item => item.id !== id);
        this.applyFilter(); // Refresh pagination/filter
        
        this.closeDeleteModal();
        this.showNotification('Inquiry deleted successfully', 'success');
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.closeDeleteModal();
        this.showNotification('Failed to delete inquiry', 'error');
      }
    });
  }

  // ====== PAGINATION LOGIC ======
  get paginatedData(): Feedback[] {
    if (this.rowsDisplay === 'All') {
      return this.filteredData;
    }

    const start = (this.currentPage - 1) * this.rowsDisplay;
    const end = start + this.rowsDisplay;

    return this.filteredData.slice(start, end);
  }

  get totalPages(): number {
    if (this.rowsDisplay === 'All') return 1;
    return Math.ceil(this.filteredData.length / this.rowsDisplay);
  }

  setRows(value: number | 'All') {
    this.rowsDisplay = value;
    this.currentPage = 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ====== STATUS UPDATE ACTIONS ======
  
  // 1. Toggle Dropdown
  toggleStatusDropdown(index: number, event: Event) {
    event.stopPropagation();
    
    // Ambil item asli dari data yang sedang tampil
    const actualItem = this.paginatedData[index];
    
    // Jika sudah resolved, jangan buka dropdown (Double protection)
    if (actualItem && actualItem.status === 'Resolved') return;

    this.openDropdownIndex = this.openDropdownIndex === index ? -1 : index;
  }

  // 2. Klik Opsi Dropdown (Update Status)
  updateStatus(item: Feedback, newStatus: Feedback['status']) {
    this.openDropdownIndex = -1; // Tutup dropdown
    if (item.status === newStatus) return; // Gak berubah
    
    // Buka Modal Konfirmasi lewat method helper
    this.openConfirmStatus(item, newStatus);
  }

  // 3. Helper Buka Modal (INI YANG TADI HILANG)
  openConfirmStatus(item: Feedback, status: Feedback['status']) {
    this.pendingFeedback = item;
    this.pendingStatus = status;
    this.isConfirmStatusOpen = true;
  }

  // 4. Konfirmasi & Panggil API
  confirmStatusChange() {
    if (!this.pendingFeedback || !this.pendingStatus) return;

    const id = this.pendingFeedback.id;
    const isResolved = this.pendingStatus === 'Resolved';

    this.inquiryService.resolveInquiry(id, isResolved).subscribe({
      next: () => {
        // Update lokal biar cepat
        if (this.pendingFeedback) {
          this.pendingFeedback.status = this.pendingStatus!;
        }
        
        this.closeConfirmStatus();
        this.showNotification('Status updated successfully', 'success');
      },
      error: (err) => {
        console.error(err);
        this.closeConfirmStatus();
        this.showNotification('Failed to update status', 'error');
      }
    });
  }

  closeConfirmStatus() {
    this.isConfirmStatusOpen = false;
    this.pendingFeedback = null;
    this.pendingStatus = null;
  }

  // ====== VIEW DETAILS ======
  viewFeedback(item: Feedback) {
    this.selectedFeedback = item;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedFeedback = null;
  }

  // ====== PROFILE & LOGOUT ======
  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeAllDropdowns() {
    this.openDropdownIndex = -1;
    this.isProfileOpen = false;
  }

  openLogoutModal() {
    this.isLogoutModalOpen = true;
    this.isProfileOpen = false;
  }

  closeLogoutModal() {
    this.isLogoutModalOpen = false;
  }

  confirmLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}