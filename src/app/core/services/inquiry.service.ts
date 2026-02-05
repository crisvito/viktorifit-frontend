import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export interface inquiryRequest{
  name: String,
  email: String,
  description: String
}

@Injectable({
  providedIn: 'root'
})

export class inquiryService{
  private baseUrl = environment.apiUrl + "inquiry";

  constructor(private http: HttpClient) { }

  createInquiry(data: inquiryRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, data);
  }

}