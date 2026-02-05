import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface faqResponse{
  id: number,
  question: String,
  answer: String
}

@Injectable({
  providedIn: 'root'
})

export class faqService{
  private apiUrl = environment.apiUrl + "faqs";

  constructor(private http: HttpClient) { }

  getFaqs() {
    return this.http.get(`${this.apiUrl}/list`);
  }
}