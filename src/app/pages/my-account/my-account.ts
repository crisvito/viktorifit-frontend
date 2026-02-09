import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfile } from '../../shared/services/user.service/user.service'; 

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-account.html',
})
export class MyAccount implements OnInit {

  userData: UserProfile = {
    name: '',
    email: '',
    phone: '',
    dob: ''
  };

  isLoading = true;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.userService.getUserProfile().subscribe((data : any) => {
      this.userData = data;
      this.isLoading = false;
    });
  }

  saveChanges() {
    this.userService.updateUserProfile(this.userData).subscribe(() => {
      alert('Changes Saved!');
    });
  }
}