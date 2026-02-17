import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { FaqService, inquiryService } from '../../core';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrls: ['./support.css']
})
export class SupportPage implements OnInit {
  activeIndex: number | null = null;
  isLoading: boolean = false;
  faqs: any[] = [];
  serverError: string = '';

  // Tambahan State untuk Toast
  showToast: boolean = false;

  constructor(
    private inquiryService: inquiryService,
    private faqService: FaqService
  ) {}

  ngOnInit() {
    this.fetchFaqs();
  }

  fetchFaqs() {
    this.isLoading = true;
    this.faqService.getFaqs().subscribe({
      next: (res: any) => {
        this.faqs = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  toggle(index: number) {
    if (this.activeIndex === index) this.activeIndex = null;
    else this.activeIndex = index;
  }

  searchFAQ(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    
    if (searchTerm) {
      this.faqs.forEach((item, index) => {
        if (item.question.toLowerCase().includes(searchTerm) || 
            item.answer.toLowerCase().includes(searchTerm)) {
          if (this.activeIndex !== index) {
            this.activeIndex = index;
          }
        }
      });
    }
  }

  contactData = { 
    name: "", 
    email: "", 
    description: "" 
  };

  submitForm(form: NgForm) {
    if(this.isLoading) return;

    if (form.invalid) {
      form.control.markAllAsTouched(); 
      return;
    }
    this.isLoading = true;
    this.serverError = '';

    this.inquiryService.createInquiry(this.contactData).subscribe({
      next: (res) => {
        this.isLoading = false;
        
        // 1. Reset Form & Data
        form.resetForm();
        this.contactData = { name: "", email: "", description: "" };

        // 2. Tampilkan Toast Success
        this.showToast = true;

        // 3. Sembunyikan Toast otomatis setelah 3 detik
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.serverError = err.error?.message || 'Failed to send inquiry. Please try again.';
      }
    })
  }

  // Helper untuk menutup toast manual (opsional jika user klik silang)
  closeToast() {
    this.showToast = false;
  }
}