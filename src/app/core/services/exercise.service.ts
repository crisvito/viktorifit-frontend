import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private apiUrl = environment.apiUrl + "exercises";

  constructor(private http: HttpClient) {}

  getAllExercises(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getExerciseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}