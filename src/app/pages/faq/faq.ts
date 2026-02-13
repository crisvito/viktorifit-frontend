import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faq.html',
})
export class Faq {

  constructor(private router: Router) {}

  // --- STATE ---
  isProfileOpen = false;
  searchText: string = '';
  rowsDisplay: any = 5;

  // --- MODAL STATE ---
  isModalOpen = false;
  newQuestion = '';
  newAnswer = '';
  
  // Variable baru untuk melacak index edit (-1 artinya Add Mode)
  editIndex: number = -1;

  // --- MODAL VIEW DETAILS STATE ---
  isViewModalOpen = false;
  selectedFaq: any = null;

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

  // --- MODAL FORM LOGIC (ADD / EDIT) ---
  
  openModal() {
    this.isModalOpen = true;
    this.editIndex = -1; // Reset ke mode "Add New" setiap kali buka
    this.newQuestion = '';
    this.newAnswer = '';
  }

  closeModal() {
    this.isModalOpen = false;
    this.newQuestion = '';
    this.newAnswer = '';
    this.editIndex = -1;
  }

  // Fungsi Edit: Ambil data item, lalu masukkan ke form
  editFaq(item: any) {
    this.editIndex = this.faqList.indexOf(item); // Cari urutan ke berapa
    this.newQuestion = item.question;
    this.newAnswer = item.answer;
    this.isModalOpen = true; // Buka modal
  }

  // Fungsi Delete: Konfirmasi lalu hapus dari list
  deleteFaq(item: any) {
    const confirmDelete = confirm('Are you sure you want to delete this FAQ?');
    if (confirmDelete) {
      this.faqList = this.faqList.filter(f => f !== item);
    }
  }

  saveFaq() {
    if (this.newQuestion.trim() && this.newAnswer.trim()) {
      
      if (this.editIndex > -1) {
        // --- MODE UPDATE (Edit) ---
        this.faqList[this.editIndex] = {
          question: this.newQuestion,
          answer: this.newAnswer
        };
      } else {
        // --- MODE CREATE (Add New) ---
        this.faqList.unshift({
          question: this.newQuestion,
          answer: this.newAnswer
        });
      }

      this.closeModal();
    } else {
      alert("Please fill in both fields!");
    }
  }

  // --- MODAL VIEW DETAILS LOGIC ---
  viewFaq(item: any) {
    this.selectedFaq = item;       
    this.isViewModalOpen = true;   
  }

  closeViewModal() {
    this.isViewModalOpen = false;  
    this.selectedFaq = null;       
  }
  
  // --- DATA DUMMY ---
  faqList = [
    { 
      question: 'Do I need gym equipment to follow the training programs?', 
      answer: 'No. Viktorifit provides both home-based and gym-based programs tailored to your available equipment.' 
    },
    { 
      question: 'How does Viktorifit’s workout recommendation system work?', 
      answer: 'Viktorifit uses your profile data, goals, and activity history to recommend the best plan for you.' 
    },
    { 
      question: 'What happens if I miss a scheduled workout?', 
      answer: 'You can reschedule or continue your program without penalty. Consistency is key!' 
    },
    { 
      question: 'Is my workout and progress data secure?', 
      answer: 'Yes. We prioritize user privacy and ensure your data is secure and encrypted.' 
    },
    { 
      question: 'Can beginners use Viktorifit?', 
      answer: 'Absolutely. Viktorifit is designed for all levels, from beginners to advanced athletes.' 
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel anytime from your account settings. Access will remain until the billing cycle ends.'
    },
    {
      question: 'Can I change my diet plan?',
      answer: 'Yes, you can adjust your dietary preferences in the settings menu at any time.'
    },
    {
      question: 'Is there a refund policy?',
      answer: 'We offer a 7-day money-back guarantee for new subscribers if they are not satisfied.'
    },
    {
      question: 'Can I use Viktorifit on multiple devices?',
      answer: 'Yes, your account syncs across all your devices so you can train anywhere.'
    },
    {
      question: 'How do I contact support?',
      answer: 'You can reach out to our support team via the Feedback page or email support@viktorifit.com.'
    },
    {
      question: 'Do you offer vegetarian or vegan meal plans?',
      answer: 'Yes, our nutrition tracking includes options for vegetarian, vegan, keto, and paleo diets.'
    },
    {
      question: 'Can I track my water intake in the app?',
      answer: 'Yes, there is a dedicated hydration tracker on your daily dashboard.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login screen and click "Forgot Password". We will send you a reset link via email.'
    },
    {
      question: 'Can I download workouts for offline use?',
      answer: 'Premium members can download workout videos to use without an internet connection.'
    },
    {
      question: 'Is there a community forum?',
      answer: 'Yes, join the Viktorifit Community in the app to share progress and tips with other users.'
    }
  ];

  get filteredData() {
    let data = this.faqList.filter(item => {
      const term = this.searchText.toLowerCase();
      return item.question.toLowerCase().includes(term) || 
             item.answer.toLowerCase().includes(term);
    });

    if (this.rowsDisplay === 'All') {
      return data;
    } else {
      return data.slice(0, this.rowsDisplay);
    }
  }
}