import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  fullname: string; 
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User; 
  token: string;
}

export interface RegisterRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
}


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private baseUrl = 'http://localhost:8080/api/v1.0/auth';

  constructor(private http: HttpClient) { }

  login(data: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  saveSession(token: string, user: any) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}