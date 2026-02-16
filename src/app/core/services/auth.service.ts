import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export interface User {
  id: number;
  fullname: string;
  username: string;
  email: string;
  role: string;
  userProfileDTO: any | null;
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

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = environment.apiUrl + 'auth';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private hasToken(): boolean {
    const token = localStorage.getItem('auth_token');
    return token !== null && token !== '';
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => {
        this.saveSession(res.token, res.user);
        this.isLoggedInSubject.next(true);

        const guestData = localStorage.getItem('guest_ml_result');
        const profile = res.user.userProfileDTO;

        // 1. CEK: Apakah profile SUDAH TERISI? (Bukan sekadar tidak null, tapi ada isinya)
        // Kita cek 'age' atau 'dob' sebagai penanda data sudah masuk
        const isProfilePopulated = profile && (profile.age !== null || profile.dob !== null);

        if (isProfilePopulated) {
          // JIKA SUDAH ADA DATA DI BE: Langsung ke Dashboard
          if (guestData) localStorage.removeItem('guest_ml_result');
          this.router.navigate(['/dashboard']);
        } 
        else if (guestData) {
          this.syncGuestData(guestData);
        } 
        else {
          this.router.navigate(['/onboarding']);
        }
      })
    );
  }
  
  private calculateAge(dob: string): number {
    if (!dob) return 25;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  private syncGuestData(guestDataString: string): void {
    const parsed = JSON.parse(guestDataString);
    const guestProfile = parsed.userProfile;

    const profilePayload = {
      dob: guestProfile.dob,
      gender: guestProfile.Gender,
      height: guestProfile.Height_cm,
      weight: guestProfile.Weight_kg,
      goal: guestProfile.Goal,
      level: guestProfile.Level,
      bodyFatCategory: guestProfile.Body_Fat_Category,
      bodyFatPercentage: guestProfile.Body_Fat_Percentage,
      frequency: guestProfile.Frequency,
      duration: guestProfile.Duration,
      badminton: guestProfile.Badminton,
      football: guestProfile.Football,
      basketball: guestProfile.Basketball,
      volleyball: guestProfile.Volleyball,
      swim: guestProfile.Swim
    };

    const profileUrl = environment.apiUrl + 'profile/create';

    this.http.post(profileUrl, profilePayload).subscribe({
      next: () => {
        localStorage.removeItem('guest_ml_result');
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.router.navigate(['/onboarding']);
      }
    });
  }

  updateUserSession(updatedProfile: any): void {
    const user = this.getUser();
    if (user) {
      user.userProfileDTO = updatedProfile; // Masukkan data profil baru ke objek user
      localStorage.setItem('auth_user', JSON.stringify(user)); // Simpan kembali ke storage
    }
  }
  
  private currentUserSubject = new BehaviorSubject<any>(this.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  updateUserOnly(res: any): void {
    const currentUser = this.getUser();
    if (!currentUser) return;

    if (res.email || res.fullname) {
      localStorage.setItem('auth_user', JSON.stringify(res));
    } else {
      currentUser.userProfileDTO = { ...currentUser.userProfileDTO, ...res };
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
    }
    
    this.currentUserSubject.next(this.getUser());
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('ml_result');
    this.isLoggedInSubject.next(false);
  }

  syncMLRecommendations(profile: any): Observable<any> {
    const baseUrl = `${environment.apiUrl}ml`;

    // 1. Pastikan Age & Data Numerik Valid
    const age = profile.age || this.calculateAge(profile.dob);

    const basePayload = {
      "Age": Number(age) || 25,
      "Gender": profile.gender || "Male",
      "Height_cm": Number(profile.height) || 170,
      "Weight_kg": Number(profile.weight) || 60,
      "Body_Fat_Category": Number(profile.bodyFatCategory) || 2,
      "Body_Fat_Percentage": Number(profile.bodyFatPercentage) || 15.0,
      "Goal": profile.goal || "Muscle Gain",
      "Frequency": Number(profile.frequency) || 4,
      "Duration": Number(profile.duration) || 60,
      "Level": profile.level || "Beginner",
      "Badminton": Number(profile.badminton || 0),
      "Football": Number(profile.football || 0),
      "Basketball": Number(profile.basketball || 0),
      "Volleyball": Number(profile.volleyball || 0),
      "Swim": Number(profile.swim || 0)
    };

    // 2. Request Tahap 1: Workout (Home & Gym) + Progress
    // Kita jalankan berbarengan (Parallel)
    return forkJoin({
      workoutHome: this.http.post(`${baseUrl}/workout-recommendation`, { 
        ...basePayload, 
        "Environment": "Home" 
      }),
      workoutGym: this.http.post(`${baseUrl}/workout-recommendation`, { 
        ...basePayload, 
        "Environment": "Gym" 
      }),
      progress: this.http.post(`${baseUrl}/userprogress-recommendation`, { 
        ...basePayload, 
        "Initial_Weight_kg": Number(profile.weight) 
      })
    }).pipe(
      // 3. Request Tahap 2: Meal Plan (Butuh data calories dari progress)
      switchMap((step1Results: any) => {
        
        // Ambil data kalori dari hasil progress
        const roadmap = step1Results.progress.roadmap || step1Results.progress;
        const week1 = Array.isArray(roadmap) ? roadmap[0] : roadmap;

        // Helper function biar kodenya gak panjang
        const createMealReq = (f: number) => this.http.post(`${baseUrl}/meal-recommendation`, {
          "Daily_Calories": Number(week1.nutrition.calories),
          "Target_Protein_g": Number(week1.macro.protein_g),
          "Target_Carbs_g": Number(week1.macro.carbs_g),
          "Target_Fat_g": Number(week1.macro.fat_g),
          "Frequency": f
        });

        // Request Meal untuk variasi frekuensi (2, 3, 4, 5 kali makan)
        return forkJoin({
          freq2: createMealReq(2),
          freq3: createMealReq(3),
          freq4: createMealReq(4),
          freq5: createMealReq(5)
        }).pipe(
          // Gabungkan hasil Tahap 1 dan Tahap 2
          map((mealResults) => ({
            step1: step1Results,
            meal: mealResults
          }))
        );
      }),

      // 4. Tahap Terakhir: Susun JSON Final & Simpan
      tap((allData: any) => {
        const { step1, meal } = allData;

        // INI STRUKTUR FINAL YANG KAMU MINTA
        const finalJsonStructure = {
          userProfile: profile,
          
          // Bagian Workout (Rapi sesuai request)
          workoutRecommendation: {
            home: step1.workoutHome, // Isinya { status: "success", workout_plan: { ... } }
            gym: step1.workoutGym    // Isinya { status: "success", workout_plan: { ... } }
          },

          // Bagian Progress
          progressRecommendation: step1.progress,

          // Bagian Meal
          mealRecommendation: meal
        };

        // Simpan ke LocalStorage
        console.log("Saving ML Result:", finalJsonStructure);
        localStorage.setItem('ml_result', JSON.stringify(finalJsonStructure));
      })
    );
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}auth/users/me`,{ 
    responseType: 'text' 
  });
  }

  changePassword(payload: any): Observable<any> {
    // Payload: { currentPassword, newPassword, confirmationPassword }
    
    // Kita tambahkan { responseType: 'text' } karena Backend mengembalikan String biasa.
    // Kalau Backend mengembalikan JSON, hapus opsi responseType ini.
    return this.http.put(`${environment.apiUrl}auth/change-password`, payload, {
      responseType: 'text' 
    });
  }

  saveSession(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  isGuest(): boolean {
    const token = this.getToken();
    return !token;
  }

  isAdmin(): boolean {
  return this.getRole() === 'ADMIN';
}

  isUser(): boolean {
    return this.getRole() === 'USER';
  }
}
