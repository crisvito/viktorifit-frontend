import { Component } from '@angular/core';
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
export class SupportPage {
  activeIndex: number | null = null;
  isLoading: boolean = false;
  faqs: any[] = [];
  serverError: string = '';

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
        alert('Inquiry sent successfully!'); 
        form.resetForm();
        this.contactData = { name: "", email: "", description: "" };
      },
      error: (err) => {
        this.isLoading = false;
        this.serverError = err.error?.message || 'Failed to send inquiry. Please try again.';
        console.error(err);
      }
    })
  }
}