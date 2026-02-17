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

  private mlDataReadySource = new BehaviorSubject<boolean>(false);
  mlDataReady$ = this.mlDataReadySource.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();

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
      tap((res) => {
        // 1. Simpan Session Utama
        this.saveSession(res.token, res.user);
        this.isLoggedInSubject.next(true);

        const guestData = localStorage.getItem('ml_result');
        const profile = res.user.userProfileDTO;

        // 2. Cek apakah profil sudah ada isinya di Database
        const isProfilePopulated =
          profile && (profile.age !== null || profile.dob !== null);

        if (isProfilePopulated) {
          // JIKA SUDAH ADA DATA: Bersihkan sampah guest dan ke Dashboard
          if (guestData) localStorage.removeItem('ml_result');
          this.router.navigate(['/dashboard']);
        } else if (guestData) {
          // JIKA BELUM ADA DATA TAPI PUNYA DATA GUEST: Jalankan Sinkronisasi
          this.syncGuestData(guestData);
        } else {
          // JIKA KOSONG SAMA SEKALI: Onboarding
          this.router.navigate(['/onboarding']);
        }
      })
    );
  }

  private syncGuestData(guestDataString: string): void {
    const parsed = JSON.parse(guestDataString);
    const guestProfile = parsed.userProfile;

    // Payload disesuaikan dengan kebutuhan Backend Profile
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
      workoutDays: guestProfile.workoutDays, // Tambahkan ini agar sinkron
      badminton: guestProfile.Badminton,
      football: guestProfile.Football,
      basketball: guestProfile.Basketball,
      volleyball: guestProfile.Volleyball,
      swim: guestProfile.Swim,
    };

    const profileUrl = environment.apiUrl + 'profile/create';

    this.http.post(profileUrl, profilePayload).subscribe({
      next: (savedProfile: any) => {

        // --- POIN KRITIS ---
        // 1. Update data User Session di LocalStorage agar ProfileDTO tidak null lagi
        this.updateUserSession(savedProfile);
        this.mlDataReadySource.next(true);
        // 2. Hapus data ML Result (Guest) agar tidak memicu redirect loop
        localStorage.removeItem('ml_result');
        // 3. Sekarang aman untuk ke Dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Gagal sinkronisasi data profil:', err);
        this.router.navigate(['/onboarding']);
      },
    });
  }

  updateUserSession(updatedProfile: any): void {
    const user = this.getUser();
    if (user) {
      user.userProfileDTO = updatedProfile;
      localStorage.setItem('auth_user', JSON.stringify(user));
      this.currentUserSubject.next(user); // Emit data user terbaru
    }
  }

  updateUserOnly(res: any): void {
    const currentUser = this.getUser();
    if (!currentUser) return;

    if (res.email || res.fullname) {
      localStorage.setItem('auth_user', JSON.stringify(res));
      this.currentUserSubject.next(res);
    } else {
      currentUser.userProfileDTO = { ...currentUser.userProfileDTO, ...res };
      localStorage.setItem('auth_user', JSON.stringify(currentUser));
      this.currentUserSubject.next(currentUser);
    }
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('ml_result');
    localStorage.removeItem('notification_state');
    this.mlDataReadySource.next(false);
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --- Fungsi ML Sync (Jika dipanggil manual dari Dashboard) ---
  syncMLRecommendations(profile: any): Observable<any> {
    const baseUrl = `${environment.apiUrl}ml`;
    const age = profile.age || this.calculateAge(profile.dob);

    const basePayload = {
      Age: Number(age) || 25,
      Gender: profile.gender || 'Male',
      Height_cm: Number(profile.height) || 170,
      Weight_kg: Number(profile.weight) || 60,
      Body_Fat_Category: Number(profile.bodyFatCategory) || 2,
      Body_Fat_Percentage: Number(profile.bodyFatPercentage) || 15.0,
      Goal: profile.goal || 'Muscle Gain',
      Frequency: Number(profile.frequency) || 4,
      Duration: Number(profile.duration) || 60,
      Level: profile.level || 'Beginner',
      Badminton: Number(profile.badminton || 0),
      Football: Number(profile.football || 0),
      Basketball: Number(profile.basketball || 0),
      Volleyball: Number(profile.volleyball || 0),
      Swim: Number(profile.swim || 0),
    };

    return forkJoin({
      workoutHome: this.http.post(`${baseUrl}/workout-recommendation`, {
        ...basePayload,
        Environment: 'Home',
      }),
      workoutGym: this.http.post(`${baseUrl}/workout-recommendation`, {
        ...basePayload,
        Environment: 'Gym',
      }),
      progress: this.http.post(`${baseUrl}/userprogress-recommendation`, {
        ...basePayload,
        Initial_Weight_kg: Number(profile.weight),
      }),
    }).pipe(
      switchMap((step1Results: any) => {
        const roadmap = step1Results.progress.roadmap || step1Results.progress;
        const week1 = Array.isArray(roadmap) ? roadmap[0] : roadmap;

        const createMealReq = (f: number) =>
          this.http.post(`${baseUrl}/meal-recommendation`, {
            Daily_Calories: Number(week1.nutrition.calories),
            Target_Protein_g: Number(week1.macro.protein_g),
            Target_Carbs_g: Number(week1.macro.carbs_g),
            Target_Fat_g: Number(week1.macro.fat_g),
            Frequency: f,
          });

        return forkJoin({
          freq2: createMealReq(2),
          freq3: createMealReq(3),
          freq4: createMealReq(4),
          freq5: createMealReq(5),
        }).pipe(
          map((mealResults) => ({
            step1: step1Results,
            meal: mealResults,
          }))
        );
      }),
      tap((allData: any) => {
        const { step1, meal } = allData;
        const finalJsonStructure = {
          userProfile: profile,
          workoutRecommendation: {
            home: step1.workoutHome,
            gym: step1.workoutGym,
          },
          progressRecommendation: step1.progress,
          mealRecommendation: meal,
        };
        localStorage.setItem('ml_result', JSON.stringify(finalJsonStructure));
        this.mlDataReadySource.next(true);
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

  deleteAccount(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}auth/users/me`, {
      responseType: 'text',
    });
  }

  changePassword(payload: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}auth/change-password`, payload, {
      responseType: 'text',
    });
  }

  isGuest(): boolean {
    return !this.getToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isUser(): boolean {
    return this.getRole() === 'USER';
  }
}

