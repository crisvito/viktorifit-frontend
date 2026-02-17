import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { AuthService, ExerciseService } from '../../../core'; 
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
  loadingText = 'Menyiapkan Dashboard...';
  userName: string = 'User';
  workoutTitle: string = 'Rest Day';
  workoutDesc: string = 'Your body needs time to recover.';
  workoutImage: string = 'pages/workoutType/rest.png';
  
  public selectedEnvironment: 'home' | 'gym' = 'home';
  private rawMLResult: any = null;

  todayActivities: any[] = [];
  workoutslist: any[] = []; // Data Suggestions
  
  // Update struktur awal bodyCondition (tambahkan properti image & category string)
  bodyCondition: any = { 
    height: 0, 
    weight: 0, 
    bmiCategory: '-', 
    bodyFat: 0, 
    goal: '-',
    bodyFatImage: '',    // Tambahan untuk HTML
    bodyFatCategory: ''  // Tambahan untuk HTML
  };
  
  public selectedChart: ChartCategory = 'weight';
  private chartDataMaster: any = {
    weight: { labels: [], actual: [], target: [], color: '#3b82f6', bg: 'rgba(59, 131, 246, 0.79)', unit: 'kg' },
    calories: { labels: [], actual: [], target: [], color: '#ec8a00', bg: 'rgba(233, 89, 0, 0.84)', unit: 'kcal' },
    duration: { labels: [], actual: [], target: [], color: '#84cc16', bg: 'rgba(137, 228, 0, 0.96)', unit: 'min' }
  };

  public lineChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: 0.4 }, point: { radius: 4, hoverRadius: 6 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const unit = this.chartDataMaster[this.selectedChart].unit;
            return ` ${context.dataset.label}: ${context.parsed.y} ${unit}`;
          }
        }
      }
    },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: false, grid: { color: '#f3f4f6' } } }
  };

  tabs = [
    { id: 'weight', label: 'Weight Target', value: '0 kg', icon: '⚖️', color: 'blue' },
    { id: 'calories', label: 'Calories Plan', value: '0 Kcal', icon: '🔥', color: 'red' },
    { id: 'duration', label: 'Duration', value: '0 min', icon: '⏱️', color: 'green' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private exerciseService: ExerciseService
  ) {}

  goToDetail(id: string) {
    if (id) {
      this.router.navigate(['/dashboard/workout-detail', id]);
    }
  }

  ngOnInit() {
    const localData = localStorage.getItem('ml_result');
    if (localData) {
      this.rawMLResult = JSON.parse(localData);
      this.parseAndLoadData(this.rawMLResult);
    } else {
      this.fetchFreshRecommendations();
    }
  }

  fetchFreshRecommendations() {
    const user = this.authService.getUser();
    const profile = user?.userProfileDTO;
    if (!profile) return;

    this.isLoading = true;
    this.loadingText = 'Menganalisa Workout & Meal...';

    const baseUrl = `${environment.apiUrl}ml`;
    const age = this.calculateAge(profile.dob);

    const basePayload = {
      Age: age,
      Gender: profile.gender === 'male' ? 'Male' : 'Female',
      Height_cm: Number(profile.height),
      Weight_kg: Number(profile.weight),
      Body_Fat_Category: Number(profile.bodyFatCategory || 3),
      Body_Fat_Percentage: Number(profile.bodyFatPercentage || 15.0),
      Goal: profile.goal || "Muscle Gain",
      Frequency: Number(profile.frequency || 3),
      Duration: Number(profile.duration || 60),
      Level: profile.level || 'Beginner',
      Badminton: profile.badminton ? 1 : 0,
      Football: profile.football ? 1 : 0,
      Basketball: profile.basketball ? 1 : 0,
      Volleyball: profile.volleyball ? 1 : 0,
      Swim: profile.swim ? 1 : 0
    };

    forkJoin({
      workoutHome: this.http.post(`${baseUrl}/workout-recommendation`, { ...basePayload, Environment: 'Home' }),
      workoutGym: this.http.post(`${baseUrl}/workout-recommendation`, { ...basePayload, Environment: 'Gym' }),
      progressResult: this.http.post<any>(`${baseUrl}/userprogress-recommendation`, { ...basePayload, Initial_Weight_kg: Number(profile.weight) })
    }).pipe(
      switchMap((results: any) => {
        const progressData = results.progressResult;
        const roadmap = progressData.roadmap || progressData;
        const week1 = Array.isArray(roadmap) ? roadmap[0] : roadmap;

        this.loadingText = 'Menyusun Variasi Meal Plan...';

        const createMealPayload = (f: number) => ({
          Daily_Calories: Number(week1.nutrition.calories),
          Target_Protein_g: Number(week1.macro.protein_g),
          Target_Carbs_g: Number(week1.macro.carbs_g),
          Target_Fat_g: Number(week1.macro.fat_g),
          Frequency: f
        });

        return forkJoin({
          freq2: this.http.post(`${baseUrl}/meal-recommendation`, createMealPayload(2)),
          freq3: this.http.post(`${baseUrl}/meal-recommendation`, createMealPayload(3)),
          freq4: this.http.post(`${baseUrl}/meal-recommendation`, createMealPayload(4)),
          freq5: this.http.post(`${baseUrl}/meal-recommendation`, createMealPayload(5))
        }).pipe(
          tap(mealResults => {
            const finalData = {
              userProfile: profile,
              workoutRecommendation: { home: results.workoutHome, gym: results.workoutGym },
              progressRecommendation: results.progressResult,
              mealRecommendation: mealResults
            };
            localStorage.setItem('ml_result', JSON.stringify(finalData));
            this.rawMLResult = finalData;
            this.parseAndLoadData(finalData);
          })
        );
      }),
      catchError(err => {
        console.error('ML Data Sync Failed:', err);
        return of(null);
      })
    ).subscribe(() => this.isLoading = false);
  }

  parseAndLoadData(data: any) {
    this.rawMLResult = data;
    const profile = data.userProfile;
    const roadmap = data.progressRecommendation?.roadmap || [];

    this.userName = this.authService.getUser()?.fullname?.split(' ')[0] || 'User';

    // --- LOGIC BARU: Ambil Info Gambar Body Fat ---
    const bodyFatInfo = this.getBodyFatInfo(profile.bodyFatCategory || 3, profile.gender || 'male');

    this.bodyCondition = {
      height: profile.height,
      weight: profile.weight,
      bmiCategory: this.calculateBMI(profile.height, profile.weight),
      bodyFat: profile.bodyFatPercentage || 0,
      goal: profile.goal || 'Not Set',
      // Masukkan ke state agar HTML bisa baca
      bodyFatImage: bodyFatInfo.image,
      bodyFatCategory: bodyFatInfo.label
    };

    this.updateTodayPlan();     
    this.mapSuggestions();      
    this.mapStatistics(roadmap, profile);
    this.updateChartData();
  }

  onEnvironmentChange(env: 'home' | 'gym') {
    this.selectedEnvironment = env;
    this.updateTodayPlan();
  }

  updateTodayPlan() {
    if (!this.rawMLResult) return;

    const envData = this.rawMLResult.workoutRecommendation?.[this.selectedEnvironment];
    const workoutPlan = envData?.workout_plan || envData;

    if (!workoutPlan) {
      this.setRestDay();
      return;
    }

    const profile = this.rawMLResult.userProfile;
    const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' }); 
    const workoutDaysArr = (profile.workoutDays || "").split(',').map((d: string) => d.trim());
    const dayIndex = workoutDaysArr.indexOf(todayShort);

    if (dayIndex !== -1) {
      const targetDayNum = dayIndex + 1;
      const allKeys = Object.keys(workoutPlan);
      const dayKey = allKeys.find(k => k.toLowerCase().includes(`day ${targetDayNum}`));

      if (dayKey && workoutPlan[dayKey]) {
        this.workoutTitle = dayKey;
        this.workoutDesc = `Ready for your ${this.selectedEnvironment} session!`;

        
        if(profile.goal == "Muscle Gain"){
          this.workoutImage = `/global/workout-type/muscleGain_transparent_background.svg`;
        }else if(profile.goal == "Weight Loss"){
          this.workoutImage = `/global/workout-type/weightLoss_transparent_background.svg`;
        }else{
          this.workoutImage = `/global/workout-type/maintain_transparent_background.svg`;
        }
          
        
        const mlExercises = workoutPlan[dayKey];

        this.exerciseService.getAllExercises().subscribe({
          next: (allDbExercises) => {
            this.todayActivities = mlExercises.map((mlItem: any) => {
              const dbMatch = allDbExercises.find(dbItem => 
                dbItem.name.toLowerCase().trim() === mlItem.exercise_name.toLowerCase().trim()
              );
              const realId = dbMatch ? dbMatch.id : mlItem.id;
              return {
                id: realId,
                name: mlItem.exercise_name,
                category: mlItem.muscle_group,
                imageUrl: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${realId}.gif`,
                duration: mlItem.duration_minutes,
                setsReps: `${mlItem.sets} x ${mlItem.reps}`,
                status: 'PENDING'
              };
            });
          },
          error: (err) => {
            this.todayActivities = mlExercises.map((mlItem: any) => ({
              id: mlItem.id,
              name: mlItem.exercise_name,
              category: mlItem.muscle_group,
              imageUrl: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${mlItem.id}.gif`,
              duration: mlItem.duration_minutes,
              setsReps: `${mlItem.sets} x ${mlItem.reps}`,
              status: 'PENDING'
            }));
          }
        });

      } else {
        this.setRestDay();
      }
    } else {
      this.setRestDay();
    }
  }

  private mapSuggestions() {
    this.exerciseService.getAllExercises().subscribe({
      next: (allExercises) => {
        const randomExercises = allExercises.sort(() => 0.5 - Math.random()).slice(0, 3);
        this.workoutslist = randomExercises.map(ex => {
          const muscles = Array.isArray(ex.targetMuscles) ? ex.targetMuscles.join(', ') : (ex.targetMuscles || "");
          const isCardio = muscles.toLowerCase().includes('cardio');
          return {
            id: ex.id,
            title: ex.name,
            type: isCardio ? 'Cardio' : 'Muscular Strength',
            duration: 15, 
            image: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${ex.id}.gif`
          };
        });
      }
    });
  }

  private mapStatistics(roadmap: any[], profile: any) {
    if (roadmap && roadmap.length > 0) {
      const chartWeeks = roadmap.slice(0, 4);
      
      const finalTarget = roadmap.find(w => w.week === 12) || roadmap[roadmap.length - 1];
      const targetWeightValue = finalTarget?.physical?.weight_kg || profile.weight;

      this.chartDataMaster.weight.labels = chartWeeks.map((w: any) => `Week ${w.week}`);
      this.chartDataMaster.weight.target = chartWeeks.map((w: any) => w.physical.weight_kg);
      this.chartDataMaster.weight.actual = this.chartDataMaster.weight.target.map((v:any) => v + 0.1);

      this.chartDataMaster.calories.labels = this.chartDataMaster.weight.labels;
      this.chartDataMaster.calories.target = chartWeeks.map((w: any) => w.nutrition.calories);
      this.chartDataMaster.calories.actual = this.chartDataMaster.calories.target.map((v:any) => v - 10);

      this.chartDataMaster.duration.labels = this.chartDataMaster.weight.labels;
      this.chartDataMaster.duration.target = chartWeeks.map(() => profile.duration || 60);
      this.chartDataMaster.duration.actual = this.chartDataMaster.duration.target;

      this.tabs[0].value = `${targetWeightValue} kg`;
      this.tabs[1].value = `${chartWeeks[0].nutrition.calories} kcal`;
      this.tabs[2].value = `${profile.duration || 60} min`;
    }
  }

  private setRestDay() {
    this.workoutTitle = "Rest Day";
    this.workoutDesc = "Saatnya otot beristirahat agar tumbuh lebih maksimal.";
    this.workoutImage = 'global/workout-type/maintain_transparent_background.svg';
    this.todayActivities = [];
  }

  setChartType(type: ChartCategory) {
    this.selectedChart = type;
    this.updateChartData();
  }

  private updateChartData() {
    const data = this.chartDataMaster[this.selectedChart];
    if (!data.labels.length) return;

    this.lineChartData = {
      labels: data.labels,
      datasets: [
        {
          data: data.target,
          label: 'Target',
          borderColor: data.color,
          backgroundColor: (context: any) => {
            const chartArea = context.chart.chartArea;
            if (!chartArea) return null;
            const gradient = context.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, data.bg);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            return gradient;
          },
          fill: true,
          pointBackgroundColor: data.color,
          pointBorderColor: '#fff',
          borderWidth: 2
        },
      ]
    };
    this.chart?.update();
  }

  getStatusColor(status: string) {
    if (!status) return 'bg-gray-100 text-gray-500';
    switch (status.toUpperCase()) {
      case 'FINISHED':
        return 'bg-lime-100 text-lime-600';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  }
  
  get completedWorkouts() { return this.todayActivities.filter(a => a.status === 'FINISHED').length; }
  get totalWorkouts() { return this.todayActivities.length; }
  get currentDuration() { return this.completedWorkouts * 15; }
  get targetDuration() { return this.totalWorkouts * 15; }
  get circleDashOffset() {
    const pct = this.totalWorkouts > 0 ? (this.completedWorkouts / this.totalWorkouts) * 100 : 0;
    return 100 - pct;
  }
  getActiveTab() { return this.tabs.find(t => t.id === this.selectedChart); }
  getLabel() { return this.selectedChart.charAt(0).toUpperCase() + this.selectedChart.slice(1); }

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
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }

  // --- Fungsi Baru Helper Body Fat Image ---
  getBodyFatInfo(catId: number, gender: string) {
    const prefix = gender.toLowerCase() === 'female' ? 'female' : 'male'; 
    
    switch(catId) {
      case 1: 
        return { label: 'Essential', image: `/global/body-fat/${prefix}_veryLean.svg` };
      case 2: 
        return { label: 'Athlete', image: `/global/body-fat/${prefix}_athletic.svg` };
      case 3: 
        return { label: 'Fitness', image: `/global/body-fat/${prefix}_average.svg` };
      case 4: 
        return { label: 'Average', image: `/global/body-fat/${prefix}_overweight.svg` };
      case 5: 
        return { label: 'Obese', image: `/global/body-fat/${prefix}_obese.svg` };
      default: 
        return { label: 'Average', image: `/global/body-fat/${prefix}_average.svg` };
    }
  }
}