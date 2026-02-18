import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { AuthService, ExerciseService, WorkoutHistoryService, UserProgressService } from '../../../core'; 
import { environment } from '../../../../environment/environment';

type ChartCategory = 'weight' | 'calories' | 'duration';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, RouterLink, FormsModule],
  templateUrl: './main-dashboard.html',
  styleUrl: './main-dashboard.css',
})
export class MainDashboardPage implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  isLoading = false;
  loadingText = 'Menyusun Program Personalisasi...';
  userName: string = 'User';
  currentWeek: number = 1; 
  
  workoutTitle: string = 'Rest Day';
  workoutDesc: string = 'Recover to grow stronger.';
  workoutImage: string = 'global/workout-type/maintain_transparent_background.svg';
  public selectedEnvironment: 'home' | 'gym' = 'home';
  
  public readyData: any = null; 
  todayActivities: any[] = [];
  workoutslist: any[] = []; 
  private currentUserId: number = 0; 
  
  bodyCondition: any = { 
    height: 0, weight: 0, bmiCategory: '-', bodyFat: 0, goal: '-',
    bodyFatImage: '', bodyFatCategory: ''  
  };
  
  public selectedChart: ChartCategory = 'weight';
  private chartDataMaster: any = {
    weight: { labels: [], target: [], color: '#3b82f6', bg: 'rgba(59, 131, 246, 0.79)' },
    calories: { labels: [], target: [], color: '#ec8a00', bg: 'rgba(233, 89, 0, 0.84)' },
    duration: { labels: [], target: [], color: '#84cc16', bg: 'rgba(137, 228, 0, 0.96)' }
  };

  public lineChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  public lineChartOptions: ChartOptions = {
    responsive: true, maintainAspectRatio: false,
    elements: { line: { tension: 0.4 }, point: { radius: 4 } },
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } } 
  };

  tabs = [
    { id: 'weight', label: 'Weight Target', value: '0 kg', icon: '⚖️', color: 'blue' },
    { id: 'calories', label: 'Calories Plan', value: '0 Kcal', icon: '🔥', color: 'red' },
    { id: 'duration', label: 'Duration', value: '0 min', icon: '⏱️', color: 'green' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private exerciseService: ExerciseService,
    private historyService: WorkoutHistoryService,
    private progressService: UserProgressService, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    this.currentUserId = user?.id || 0;
    this.userName = user?.fullname?.split(' ')[0] || 'User';
    this.initDashboard();
  }

  private getStrictUserProfile() {
    const sessionStr = localStorage.getItem('auth_token');
    if (sessionStr) {
        try {
            const session = JSON.parse(sessionStr);
            if (session.userProfileDTO) return session.userProfileDTO;
        } catch (e) { console.warn('Gagal parsing auth_token', e); }
    }
    return this.authService.getUser()?.userProfileDTO;
  }

  // ==========================================
  // 1. INITIALIZER
  // ==========================================
  initDashboard() {
    this.isLoading = true;
    this.readyData = null; 

    const cached = localStorage.getItem('ml_data_ready');

    if (cached) {
        try {
            const parsedData = JSON.parse(cached);
            if (parsedData.progressRecommendation && parsedData.progressRecommendation.startDate) {
                this.currentWeek = this.progressService.calculateCurrentWeek(parsedData.progressRecommendation.startDate);
            }
            this.processAndEnrich(parsedData, false); 
        } catch (e) {
            this.fetchAndEnrich(true);
        }
    } else {
        this.fetchAndEnrich(true); 
    }
  }

  // ==========================================
  // 2. ML REQUESTS
  // ==========================================
  createFreshRecommendationRequest() {
    const profile = this.getStrictUserProfile();
    if (!profile) return of(null);

    const realDuration = Number(profile.workoutDuration || profile.duration || 60);
    const baseUrl = `${environment.apiUrl}ml`;
    const age = this.calculateAge(profile.dob);

    const basePayload = {
      Age: Number(age || 20),
      Gender: profile.gender === 'female' ? 'Female' : 'Male',
      Height_cm: Number(profile.height),
      Weight_kg: Number(profile.weight),
      Body_Fat_Category: Number(profile.bodyFatCategory),
      Body_Fat_Percentage: Number(profile.bodyFatPercentage),
      Goal: profile.goal,
      Frequency: Number(profile.frequency),
      Duration: realDuration, 
      Level: profile.level,
      Badminton: profile.badminton ? 1 : 0, Football: profile.football ? 1 : 0,
      Basketball: profile.basketball ? 1 : 0, Volleyball: profile.volleyball ? 1 : 0, Swim: profile.swim ? 1 : 0
    };

    return forkJoin({
      workoutHome: this.http.post(`${baseUrl}/workout-recommendation`, { ...basePayload, Environment: 'Home' }),
      workoutGym: this.http.post(`${baseUrl}/workout-recommendation`, { ...basePayload, Environment: 'Gym' }),
      progressResult: this.http.post<any>(`${baseUrl}/userprogress-recommendation`, { ...basePayload, Initial_Weight_kg: Number(profile.weight) })
    }).pipe(
      switchMap((res: any) => {
        const roadmap = res.progressResult.roadmap || res.progressResult;
        const week1 = Array.isArray(roadmap) ? roadmap[0] : roadmap;
        const mealPayload = (f: number) => ({
            Daily_Calories: Number(week1.nutrition.calories), Target_Protein_g: Number(week1.macro.protein_g),
            Target_Carbs_g: Number(week1.macro.carbs_g), Target_Fat_g: Number(week1.macro.fat_g), Frequency: f
        });
        return forkJoin({
            freq2: this.http.post(`${baseUrl}/meal-recommendation`, mealPayload(2)),
            freq3: this.http.post(`${baseUrl}/meal-recommendation`, mealPayload(3)),
            freq4: this.http.post(`${baseUrl}/meal-recommendation`, mealPayload(4)),
            freq5: this.http.post(`${baseUrl}/meal-recommendation`, mealPayload(5))
        }).pipe(map(meals => ({
            userProfile: profile, workoutRecommendation: { home: res.workoutHome, gym: res.workoutGym },
            progressRecommendation: res.progressResult, mealRecommendation: meals
        })));
      }),
      catchError(() => of(null))
    );
  }

  fetchAndEnrich(shouldSave: boolean, existingRoadmap?: any) {
    this.createFreshRecommendationRequest().subscribe(newData => {
      if (newData) {
        if (existingRoadmap) newData.progressRecommendation = existingRoadmap;
        const startDate = newData.progressRecommendation.startDate || new Date();
        this.currentWeek = this.progressService.calculateCurrentWeek(startDate);

        if (shouldSave) {
          this.progressService.saveProgress(this.currentUserId, newData.progressRecommendation).subscribe();
          this.progressService.saveWorkout(this.currentUserId, 'home', newData.workoutRecommendation.home).subscribe();
          this.progressService.saveWorkout(this.currentUserId, 'gym', newData.workoutRecommendation.gym).subscribe();
        }
        this.processAndEnrich(newData, true);
      } else {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  processAndEnrich(mlData: any, saveToLocal: boolean) {
    this.exerciseService.getAllExercises().pipe(catchError(() => of([]))).subscribe((dbExercises) => {
      this.enrichWorkoutPlan(mlData.workoutRecommendation?.home, dbExercises);
      this.enrichWorkoutPlan(mlData.workoutRecommendation?.gym, dbExercises);
      this.enrichAllMealPlans(mlData.mealRecommendation);
      if (saveToLocal) localStorage.setItem('ml_data_ready', JSON.stringify(mlData));
      this.readyData = mlData;
      this.renderDashboard();
      this.isLoading = false;
      this.cdr.detectChanges(); 
    });
  }

  enrichWorkoutPlan(envData: any, dbExercises: any[]) {
    if (!envData) return;
    const plan = envData.workoutPlan || envData.workout_plan; 
    if (!plan) return;
    Object.keys(plan).forEach(dayKey => {
      plan[dayKey].forEach((ex: any) => {
        const name = ex.exerciseName || ex.exercise_name;
        const match = dbExercises.find(e => e.name.toLowerCase().trim() === name.toLowerCase().trim());
        ex.realId = match ? match.id : null; 
        ex.imageUrl = match ? `https://res.cloudinary.com/dmhzqtzrr/image/upload/${match.id}.gif` : 'assets/images/placeholder_exercise.png';
        const rawMuscle = match ? (match.muscle_group || match.category || '') : (ex.muscleGroup || ex.muscle_group || '');
        const cleanMuscles = rawMuscle.toLowerCase();
        ex.type = cleanMuscles.includes('cardio') ? 'Cardio' : 'Mascular';
      });
    });    
  }

  enrichAllMealPlans(mealRecs: any) {
    if(!mealRecs) return;
    const dummyImages = ['pages/steak.png', 'pages/salmon.png', 'pages/chicken.png', 'pages/oatmeal.png'];
    Object.keys(mealRecs).forEach(key => {
      const plan = mealRecs[key];
      const items = plan.meal_plan || plan.mealPlan;
      if (items) items.forEach((m: any, i: number) => m.imageUrl = dummyImages[i % dummyImages.length]);
    });
  }

  // ==========================================
  // 3. UI RENDERING (PURE DISPLAY)
  // ==========================================
  renderDashboard() {
    if (!this.readyData) return;
    const profile = this.readyData.userProfile;
    const roadmap = (this.readyData.progressRecommendation?.roadmap || this.readyData.progressRecommendation) || [];
    const currentWeekData = roadmap[this.currentWeek - 1] || roadmap[0];

    const bodyFatInfo = this.getBodyFatInfo(profile.bodyFatCategory || 2, profile.gender || 'male');
    this.bodyCondition = {
      height: profile.height, weight: profile.weight, bmiCategory: this.calculateBMI(profile.height, profile.weight),
      bodyFat: profile.bodyFatPercentage || 0, goal: profile.goal || 'Not Set',
      bodyFatImage: bodyFatInfo.image, bodyFatCategory: bodyFatInfo.label
    };

    this.updateTodayPlan();
    this.mapSuggestions();
    this.mapStatistics(roadmap, profile, currentWeekData);
    this.updateChartData();
  }

  updateTodayPlan() {
    this.setRestDay(); // Default: Rest Day
    const envData = this.readyData.workoutRecommendation?.[this.selectedEnvironment];
    const workoutPlan = envData?.workoutPlan || envData?.workout_plan;
    if (!workoutPlan) return;

    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' }); 
    const workoutDaysArr = (this.readyData.userProfile.workoutDays || "").split(',').map((d: string) => d.trim());
    const dayIndex = workoutDaysArr.indexOf(todayShort);

    // Jika hari ini tidak ada di jadwal latihan user
    if (dayIndex === -1) return;

    // Hitung posisi hari (Day 1, Day 2, dst) berdasarkan urutan Mon-Sun
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sortedDays = (this.readyData.userProfile.workoutDays || "").split(',').map((d: string) => d.trim()).sort((a:any, b:any) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    const dayNumber = sortedDays.indexOf(todayShort) + 1;

    const dayKey = Object.keys(workoutPlan).find(k => k.toLowerCase().includes(`day ${dayNumber}`));
    
    if (dayKey && workoutPlan[dayKey]) {
        // TAMPILKAN RENCANA (Hanya UI, Tidak simpan DB)
        this.workoutTitle = dayKey;
        this.workoutDesc = `Day Workout ${dayNumber} • Week ${this.currentWeek}`;
        this.workoutImage = this.readyData.userProfile.goal === "Muscle Gain" ? '/global/workout-type/muscleGain_transparent_background.svg' : '/global/workout-type/weightLoss_transparent_background.svg';
        
        this.todayActivities = workoutPlan[dayKey].map((ex: any) => ({
            id: ex.realId, 
            name: ex.exerciseName || ex.exercise_name, 
            category: ex.muscleGroup || ex.muscle_group, 
            imageUrl: ex.imageUrl, 
            duration: ex.durationMinutes || ex.duration_minutes, 
            setsReps: `${ex.sets} x ${ex.reps}`,
            type: ex.type
        }));
    }
    this.cdr.detectChanges();
  }

  mapStatistics(roadmap: any[], profile: any, currentWeekData: any) {
    if (!roadmap || roadmap.length === 0) return;
    const startIndex = Math.max(0, this.currentWeek - 1); 
    const chartWeeks = roadmap.slice(startIndex, startIndex + 4);
    const labels = chartWeeks.map((w: any) => `W${w.week}`);
    this.chartDataMaster.weight.labels = labels;
    this.chartDataMaster.weight.target = chartWeeks.map((w: any) => Number(w.physical?.weightKg || w.physical?.weight_kg || 0));
    this.chartDataMaster.calories.labels = labels;
    this.chartDataMaster.calories.target = chartWeeks.map((w: any) => Number(w.nutrition?.calories || 0));
    this.chartDataMaster.duration.labels = labels;
    this.chartDataMaster.duration.target = chartWeeks.map(() => Number(profile.duration || 60));
    this.tabs[0].value = `${(chartWeeks[chartWeeks.length-1] || currentWeekData).physical?.weightKg || 0} kg`; 
    this.tabs[1].value = `${currentWeekData?.nutrition?.calories || 0} kcal`;
    this.tabs[2].value = `${profile.duration || 60} min`;
  }

  // ==========================================
  // 5. HELPERS
  // ==========================================
  onEnvironmentChange(env: 'home' | 'gym') { this.selectedEnvironment = env; this.updateTodayPlan(); }
  setChartType(type: ChartCategory) { this.selectedChart = type; this.updateChartData(); }
  
  private updateChartData() {
    const data = this.chartDataMaster[this.selectedChart];
    if (!data || !data.labels || data.labels.length === 0) return;
    this.lineChartData = {
      labels: [...data.labels], datasets: [{
          data: [...data.target], label: 'Target', borderColor: data.color, backgroundColor: data.bg,
          fill: true, pointBackgroundColor: '#fff', pointBorderColor: data.color,
          pointRadius: 6, pointHoverRadius: 8, borderWidth: 3, tension: 0.4          
      }]
    };
    if (this.chart) this.chart.update();
  }

  private mapSuggestions() {
    const plan = this.readyData?.workoutRecommendation?.home?.workoutPlan || this.readyData?.workoutRecommendation?.home?.workout_plan;
    if (plan) {
        const firstDay = plan[Object.keys(plan)[0]];
        if (firstDay) this.workoutslist = firstDay.slice(0, 3).map((ex:any) => ({ 
          id: ex.realId, title: ex.exerciseName || ex.exercise_name, type: 'Strength', image: ex.imageUrl 
        }));
    }
  }

  private setRestDay() { 
    this.workoutTitle = "Rest Day"; 
    this.todayActivities = []; 
    this.workoutImage = 'global/workout-type/maintain_transparent_background.svg'; 
  }

  private calculateAge(dob: string): number {
    if (!dob) return 25;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  }

  private calculateBMI(h: number, w: number): string {
    const bmi = w / ((h / 100) * (h / 100));
    return bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  }

  getBodyFatInfo(catId: number, gender: string) {
    const prefix = (gender || 'male').toLowerCase() === 'female' ? 'female' : 'male';
    const labels = ['', 'Very Lean', 'Athlete', 'Fitness', 'Average', 'Obese'];
    return { label: labels[catId] || 'Average', image: `/global/body-fat/${prefix}_average.svg` };
  }

  getActiveTab() { return this.tabs.find(t => t.id === this.selectedChart); }
  getLabel() { return this.selectedChart.charAt(0).toUpperCase() + this.selectedChart.slice(1); }
  goToDetail(id: string) { if (id) this.router.navigate(['/dashboard/workout-detail', id]); }
}