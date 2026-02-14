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

  isProfileOpen = false;
  searchText: string = '';
  rowsDisplay: any = 5;

  isModalOpen = false;
  isViewModalOpen = false;
  selectedFeedback: any = null;

  newUser = '';
  newEmail = '';
  newMessage = '';
  newStatus = 'Pending';

  openDropdownIndex: number = -1; 

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }

  logout() {
    this.router.navigate(['/login']);
  }

  setRows(count: number | 'All') {
    this.rowsDisplay = count;
  }

  toggleStatusDropdown(index: number, event: Event) {
    event.stopPropagation();
    
    if (this.openDropdownIndex === index) {
      this.openDropdownIndex = -1;
    } else {
      this.openDropdownIndex = index;
    }
  }

  updateStatus(item: any, newStatus: string) {
    item.status = newStatus;
    this.openDropdownIndex = -1;
  }

  closeAllDropdowns() {
    this.openDropdownIndex = -1;
  }

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
  
  feedbackList = [
    { 
      user: 'Jonathan Maxwell', 
      email: 'j.maxwell_pro@vfit-agency.com', 
      message: 'The AI-generated workout plan is great, but the rest timer sometimes freezes when I switch apps on my iPhone 14 Pro during the high-intensity interval training sessions.', 
      status: 'Resolved' 
    },
    { 
      user: 'Katherine Rosebud', 
      email: 'katherine.rose@fit-member.org', 
      message: 'Requesting a synchronization feature for MyFitnessPal and Apple Health. It would make tracking macros and calories much easier for users who use multiple apps.', 
      status: 'In Progress' 
    },
    { 
      user: 'Leonard Richardson', 
      email: 'l.richardson@corporate-health.net', 
      message: 'The application interface consistently lags and even crashes when loading the 3D body map visualization on Android devices with lower RAM.', 
      status: 'In Progress' 
    },
    { 
      user: 'Samantha Miller', 
      email: 's.miller@globalfit.com', 
      message: 'I noticed that some video tutorials for the advanced leg press machine are missing audio instructions, making it hard to understand the proper form.', 
      status: 'Pending' 
    },
    { 
      user: 'David Harrison', 
      email: 'd.harrison@techlife.io', 
      message: 'The dark mode UI has some contrast issues in the analytics tab, making the graph labels very hard to read when I am working out in a dimly lit gym.', 
      status: 'Resolved' 
    },
    { 
      user: 'Emily Thompson', 
      email: 'emily.t@wellnesshub.net', 
      message: 'It would be very helpful if we could export our monthly progress reports and body measurement statistics as PDF files to share with our personal trainers.', 
      status: 'Dismiss' 
    },
    { 
      user: 'Michael Chang', 
      email: 'm.chang@startup.inc', 
      message: 'Great app overall! Just wish there were more vegan meal options in the nutrition section, specifically high-protein breakfast ideas.', 
      status: 'Resolved' 
    },
    { 
      user: 'Sarah Jenkins', 
      email: 'sarah.j@fitness-daily.com', 
      message: 'Login via Google seems to be broken on the latest iOS update. It keeps redirecting me back to the welcome screen without logging me in.', 
      status: 'Pending' 
    }
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