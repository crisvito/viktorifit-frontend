import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getProgress(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}progress/${userId}`);
  }

  // Sesuai DTO: @JsonProperty("total_weeks"), dll
  saveProgress(userId: number, ai: any): Observable<any> {
    const payload = {
      status: ai.status,
      total_weeks: ai.total_weeks || ai.totalWeeks,
      roadmap: ai.roadmap.map((r: any) => ({
        week: r.week,
        physical: {
          weight_kg: r.physical.weight_kg || r.physical.weightKg,
          body_fat_percentage: r.physical.body_fat_percentage || r.physical.bodyFatPercentage
        },
        nutrition: {
          calories: r.nutrition.calories,
          water_ml: r.nutrition.water_ml || r.nutrition.waterMl,
          sugar_limit_g: r.nutrition.sugar_limit_g || r.nutrition.sugarLimitG
        },
        macro: {
          protein_g: r.macro.protein_g || r.macro.proteinG,
          carbs_g: r.macro.carbs_g || r.macro.carbsG,
          fat_g: r.macro.fat_g || r.macro.fatG,
          fiber_g: r.macro.fiber_g || r.macro.fiberG
        }
      }))
    };
    return this.http.post(`${this.baseUrl}progress/save/${userId}`, payload);
  }

  getWorkout(userId: number, env: string): Observable<any> {
    return this.http.get(`${this.baseUrl}workout/${userId}/${env}`);
  }

  // Sesuai DTO: Standard camelCase (exerciseName, caloriesBurned, dll)
  saveWorkout(userId: number, env: string, ai: any): Observable<any> {
    const plan: any = {};
    const rawPlan = ai.workout_plan || ai.workoutPlan;

    Object.keys(rawPlan).forEach(day => {
      plan[day] = rawPlan[day].map((ex: any) => ({
        muscleGroup: ex.muscle_group || ex.muscleGroup,
        exerciseName: ex.exercise_name || ex.exerciseName,
        sets: ex.sets,
        reps: ex.reps,
        caloriesBurned: ex.calories_burned || ex.caloriesBurned,
        durationMinutes: ex.duration_minutes || ex.durationMinutes,
        restMinutes: ex.rest_minutes || ex.restMinutes,
        equipment: ex.equipment,
        instructions: ex.instructions
      }));
    });

    const payload = { status: ai.status, workoutPlan: plan };
    return this.http.post(`${this.baseUrl}workout/save/${userId}/${env}`, payload);
  }

  calculateCurrentWeek(startDate: string): number {
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    let week = Math.floor(diff / 7) + 1;
    return week > 12 ? 12 : week;
  }
}