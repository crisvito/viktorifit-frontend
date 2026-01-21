import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrls: ['./support.css']
})
export class SupportComponent {
  activeIndex: number | null = null;
  formSubmitted = false;
  
  contactData = { 
    name: '', 
    email: '', 
    description: '' 
  };
  
  faqItems = [
    {
      question: 'Do I need gym equipment to follow the training programs?',
      answer: 'No. Viktorifit provides both home-based and gym-based programs. You can choose according to your available equipment.'
    },
    {
      question: 'How does Viktorifit\'s workout recommendation system work?',
      answer: 'Viktorifit uses your profile data, goals, and activity history to recommend workouts that match your fitness level.'
    },
    {
      question: 'What happens if I miss a scheduled workout?',
      answer: 'You can reschedule or continue your program without penalties. Viktorifit adapts to your progress, not perfection.'
    },
    {
      question: 'Is my workout and progress data secure?',
      answer: 'Yes. We prioritize user privacy and ensure your data is securely stored and protected.'
    },
    {
      question: 'Can beginners use Viktorifit?',
      answer: 'Absolutely. Viktorifit is designed for all levels, from beginners to advanced users.'
    },
    {
      question: 'Is Viktorifit free to use?',
      answer: 'Viktorifit offers free features, with optional premium plans for advanced programs and personalized recommendations.'
    }
  ];

  toggle(index: number) {
    if (this.activeIndex === index) {
      this.activeIndex = null;
    } else {
      this.activeIndex = index;
    }
  }

  searchFAQ(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase().trim();
    
    if (searchTerm) {
      console.log('Searching for:', searchTerm);
      
      // Auto-open FAQ items yang mengandung search term
      this.faqItems.forEach((item, index) => {
        if (item.question.toLowerCase().includes(searchTerm) || 
            item.answer.toLowerCase().includes(searchTerm)) {
          if (this.activeIndex !== index) {
            this.activeIndex = index;
          }
        }
      });
    }
  }

  onTextareaInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const currentLength = textarea.value.length;
    
    if (currentLength > 200) {
      textarea.value = textarea.value.substring(0, 200);
      this.contactData.description = textarea.value;
    } else {
      this.contactData.description = textarea.value;
    }
  }

  getRemainingChars(): number {
    return this.contactData.description.length;
  }

  markAsTouched(control: NgModel) {
    control.control.markAsTouched();
  }

  isFormValid(): boolean {
    return this.contactData.name.trim() !== '' && 
           this.contactData.email.trim() !== '' && 
           this.isValidEmail(this.contactData.email) &&
           this.contactData.description.trim() !== '';
  }

  submitForm() {
    this.formSubmitted = true;
    
    if (!this.isFormValid()) {
      // Scroll ke error pertama
      setTimeout(() => {
        const firstError = document.querySelector('.error-message');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (this.contactData.description.length > 200) {
      alert('Description cannot exceed 200 characters.');
      return;
    }

    // Simpan data form
    console.log('Form Submitted:', {
      name: this.contactData.name,
      email: this.contactData.email,
      description: this.contactData.description,
      timestamp: new Date().toISOString()
    });
    
    // Show loading
    this.showLoading();
    
    // Simulate API call
    setTimeout(() => {
      alert('Message sent successfully! We will get back to you within 24 hours.');
      
      // Reset form
      this.contactData = { name: '', email: '', description: '' };
      this.formSubmitted = false;
      this.hideLoading();
    }, 1500);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showLoading() {
    console.log('Sending message...');
  }

  private hideLoading() {
    console.log('Message sent!');
  }
}