import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dob: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  // Kunci Database. Jangan diubah-ubah string-nya.
  private STORAGE_KEY = 'viktorifit_user_db';

  constructor() { }

  getUserProfile(): Observable<UserProfile> {
    // 1. Cek LocalStorage
    const storedData = localStorage.getItem(this.STORAGE_KEY);
    
    let data: UserProfile;

    if (storedData) {
      data = JSON.parse(storedData);
    } else {
      data = {
        name: 'John Green',
        email: 'johngreen@gmail.com',
        phone: '',
        dob: '20 / 2 / 1999'
      };
    }
    return of(data); 
  }

  updateUserProfile(newData: UserProfile): Observable<boolean> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newData));
    return of(true);
  }
}