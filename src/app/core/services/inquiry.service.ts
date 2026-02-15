import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

/* ========= INTERFACES ========= */

// request dari USER
export interface InquiryRequest {
  name: string;
  email: string;
  description: string;
}

// response / entity (ADMIN)
export interface Inquiry {
  id: number;
  name: string;
  email: string;
  description: string;
  resolved: boolean; // true = resolved, false = not
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class inquiryService {

  private baseUrl = environment.apiUrl + 'inquiry';

  constructor(private http: HttpClient) {}

  createInquiry(data: InquiryRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, data);
  }

  getInquiries(): Observable<Inquiry[]> {
    return this.http.get<Inquiry[]>(`${this.baseUrl}/list`);
  }

  getInquiryDetail(id: number): Observable<Inquiry> {
    return this.http.get<Inquiry>(`${this.baseUrl}/detail/${id}`);
  }

  removeInquiry(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/remove/${id}`, { 
      responseType: 'text' 
    });
  }

  resolveInquiry(id: number, resolved: boolean): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/resolve/${id}`,
      { responseType: 'text' }
    );
  }
}
