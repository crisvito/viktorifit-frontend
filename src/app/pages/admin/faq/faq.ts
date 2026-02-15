import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaqService, Faq } from '../../../core';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqPage implements OnInit {

  // ====== DATA ======
  data: Faq[] = [];
  filteredData: Faq[] = [];

  selectedFaq: Faq | null = null;

  // ====== NOTIFICATION ======
  notifMessage: string = '';
  notifType: 'success' | 'error' | '' = '';
  showNotif: boolean = false;

  // ====== FORM ======
  newQuestion: string = '';
  newAnswer: string = '';
  editIndex: number = -1;
  editId: number | null = null;

  // ====== PAGINATION ======
  currentPage: number = 1;
  rowsDisplay: number | 'All' = 10;

  // ====== UI STATE ======
  searchText: string = '';

  isModalOpen = false;
  isViewModalOpen = false;
  isProfileOpen = false;
  isLogoutModalOpen = false;

  // delete confirmation
  isDeleteConfirmOpen = false;
  deleteTarget: Faq | null = null;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.loadFaq();
  }

  // ====== LOAD ======
  loadFaq() {
    this.faqService.getFaqs().subscribe(res => {
      this.data = res as Faq[];
      this.filteredData = [...this.data];
      this.currentPage = 1;
    });
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notifMessage = message;
    this.notifType = type;
    this.showNotif = true;

    setTimeout(() => {
      this.showNotif = false;
      this.notifMessage = '';
      this.notifType = '';
    }, 3000); // 3 detik
  }


  // ====== FILTER ======
  applyFilter() {
    const keyword = this.searchText.toLowerCase().trim();

    if (!keyword) {
      this.filteredData = [...this.data];
    } else {
      this.filteredData = this.data.filter(faq =>
        faq.question.toLowerCase().includes(keyword) ||
        faq.answer.toLowerCase().includes(keyword)
      );
    }

    this.currentPage = 1; // ⬅️ WAJIB
  }

  setRows(value: number | 'All') {
    this.rowsDisplay = value;
    this.currentPage = 1;
  }

  // ====== PAGINATED VIEW (AMAN, TIDAK MERUSAK) ======
  get paginatedData(): Faq[] {
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

  // ====== PROFILE ======
  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  // ====== LOGOUT ======
  openLogoutModal() {
    this.isLogoutModalOpen = true;
    this.isProfileOpen = false;
  }

  closeLogoutModal() {
    this.isLogoutModalOpen = false;
  }

  confirmLogout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  // ====== MODAL ADD / EDIT ======
  openModal() {
    this.resetForm();
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  editFaq(item: Faq) {
    this.editIndex = this.data.indexOf(item);
    this.editId = item.id!;
    this.newQuestion = item.question;
    this.newAnswer = item.answer;
    this.isModalOpen = true;
  }

  saveFaq() {
    if (!this.newQuestion || !this.newAnswer) return;

    const payload = {
      question: this.newQuestion,
      answer: this.newAnswer
    };

    if (this.editId) {
      this.faqService.updateFaq(this.editId, payload).subscribe({
        next: () => {
          this.loadFaq();
          this.closeModal();
          this.showNotification('successfully updated FAQ', 'success');
        },
        error: () =>{
          this.showNotification('Failed remove FAQ', 'error');
        }
      });
    } else {
      this.faqService.createFaq(payload).subscribe({
        next: () =>{
          this.loadFaq();
          this.closeModal();
          this.showNotification('successfully created FAQ', 'success');
        },
        error: () =>{
          this.showNotification('Failed create FAQ', 'error');
        }
      });
    }
  }

  resetForm() {
    this.newQuestion = '';
    this.newAnswer = '';
    this.editIndex = -1;
    this.editId = null;
  }

  // ====== VIEW ======
  viewFaq(item: Faq) {
    this.selectedFaq = item;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.selectedFaq = null;
  }

  // ====== DELETE ======
  deleteFaq(item: Faq) {
    this.deleteTarget = item;
    this.isDeleteConfirmOpen = true;
  }

  cancelDelete() {
    this.deleteTarget = null;
    this.isDeleteConfirmOpen = false;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;

    this.faqService.deleteFaq(this.deleteTarget.id!).subscribe({
      next: () => {
        this.loadFaq();
        this.cancelDelete();
        this.showNotification('Successfully Removed FAQ', 'success');
      },
      error: () => {
        this.showNotification('Failed removed FAQ', 'error');
      }
    });
  }
}
