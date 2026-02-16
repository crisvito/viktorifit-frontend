import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class WorkoutHistoryService {
  private apiUrl = environment.apiUrl + "history";

  constructor(private http: HttpClient) {}

  // Simpan latihan baru ke database (Mark as Done)
  saveHistory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // Ambil history berdasarkan User ID
  getHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Update status (Misal untuk fitur Undo)
  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}