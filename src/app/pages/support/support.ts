import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrls: ['./support.css']
})
export class SupportPage {
  // --- BAGIAN FAQ (TETAP SAMA SEPERTI ASLIMU) ---
  activeIndex: number | null = null;
  
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

  contactData = { 
    name: '', 
    email: '', 
    description: '' 
  };

  submitForm(form: NgForm) {
    // 1. Cek Validitas Pakai Bawaan Angular
    if (form.invalid) {
      // Ini trik "markAsTouched" yang kamu tanya sebelumnya
      // Otomatis bikin semua input jadi merah (error) kalau belum diisi
      form.control.markAllAsTouched(); 
      return;
    }

    // 2. Simulasi Kirim (Jika valid)
    // Tidak perlu cek length manual lagi karena di HTML sudah kita kunci
    setTimeout(() => {
      alert('Message sent successfully! We will get back to you within 24 hours.');
      
      // Reset form ke kondisi awal (kosong dan bersih)
      form.resetForm();
    }, 1500);
  }
}