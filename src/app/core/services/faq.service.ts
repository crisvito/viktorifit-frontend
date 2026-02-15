import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface Faq{
  id?: number,
  question: string,
  answer: string
}

@Injectable({
  providedIn: 'root'
})

export class FaqService{
  private apiUrl = environment.apiUrl + "faqs";

  constructor(private http: HttpClient) { }

  getFaqs() {
    return this.http.get(`${this.apiUrl}/list`);
  }

  createFaq(faq: Faq): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, faq);
  }

  updateFaq(id: number, faq: Faq): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${id}`, faq);
  }

  deleteFaq(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${id}`);
  }
}