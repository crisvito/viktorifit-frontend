import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

type ChartCategory = 'weight' | 'calories' | 'duration';

// Interface untuk data mingguan
interface WeeklyData {
  week: string;
  cal: number;
  dur: number;
  weight: number;
}

// Interface untuk target
interface Targets {
  calories: number;
  duration: number;
  weight: number;
}

// Interface untuk aktivitas hari ini
interface Activity {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  duration: number;
  progress: number;
  status: 'Finished' | 'On Progress' | 'Not Started';
}

@Component({
  selector: 'dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardPage {

  // Data ini ceritanya didapat dari database/service kamu nanti
  userName: string = 'John';
  workoutTitle: string = 'Leg Day';
  workoutDesc: string = "Today's workout will focus on strength on your leg. Please Focus!";
  
  // Path gambar ilustrasi (ini yang berubah-ubah sesuai workout)
  workoutImage: string = 'assets/workoutType/weightLoss.png';

   @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // --- 1. DATA AKTIVITAS HARI INI ---
  todayActivities: Activity[] = [
    {
      id: 1,
      name: 'Running',
      category: 'Cardio',
      imageUrl: 'assets/images/running-icon.png',
      duration: 20,
      progress: 100,
      status: 'Finished'
    },
    {
      id: 2,
      name: 'Swimming',
      category: 'Cardio',
      imageUrl: 'assets/images/swimming-icon.png',
      duration: 60,
      progress: 50,
      status: 'On Progress'
    },
    {
      id: 3,
      name: 'Yoga',
      category: 'Flexibility',
      imageUrl: 'assets/images/yoga-icon.png',
      duration: 30,
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 3,
      name: 'Yoga',
      category: 'Flexibility',
      imageUrl: 'assets/images/yoga-icon.png',
      duration: 30,
      progress: 0,
      status: 'Not Started'
    },
    {
      id: 3,
      name: 'Yoga',
      category: 'Flexibility',
      imageUrl: 'assets/images/yoga-icon.png',
      duration: 30,
      progress: 0,
      status: 'Not Started'
    },
  ];

  // --- 2. LOGIKA HELPER (Progress Circle & Cards) ---
  getStatusColor(status: string): string {
    switch (status) {
      case 'Finished': return 'bg-lime-100 text-lime-600';
      case 'On Progress': return 'bg-yellow-100 text-yellow-600';
      case 'Not Started': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  get completedWorkouts(): number {
    return this.todayActivities.filter(a => a.status === 'Finished').length;
  }

  get totalWorkouts(): number {
    return this.todayActivities.length;
  }

  get currentDuration(): number {
    return this.todayActivities
      .filter(a => a.status === 'Finished')
      .reduce((total, activity) => total + activity.duration, 0);
  }

  get targetDuration(): number {
    return this.todayActivities.reduce((total, activity) => total + activity.duration, 0);
  }

  get progressPercentage(): number {
    if (this.totalWorkouts === 0) return 0;
    return (this.completedWorkouts / this.totalWorkouts) * 100;
  }

  get circleDashOffset(): number {
    const circumference = 100;
    return circumference - (this.progressPercentage / 100) * circumference;
  }

  // --- 3. DATA & LOGIKA GRAFIK MINGGUAN (CHART.JS) ---
  
  // Target Mingguan (Untuk Normalisasi Persen)
  targets: Targets = {
    calories: 2500,
    duration: 90,
    weight: 75 // Target berat badan ideal
  };

  // Data Mentah Mingguan
  rawWeeklyData: WeeklyData[] = [
    { week: 'Week 1', cal: 1500, dur: 45, weight: 85 },
    { week: 'Week 2', cal: 2000, dur: 60, weight: 83 },
    { week: 'Week 3', cal: 2500, dur: 90, weight: 81 }, // Target tercapai
    { week: 'Week 4', cal: 1800, dur: 50, weight: 80 },
  ];

  

  // --- 4. DATA BODY CONDITION & WORKOUT LIST ---
  public bodyCondition = {
    height: 170,
    weight: 80,
    bmiCategory: 'Overweight',
    bodyFat: 22,
    goal: 'Cardio Fitness'
  };

  workoutslist = [
    {
      id: 1,
      type:'Chest',
      title: 'Morning Yoga Flow',
      description: 'Rangkaian gerakan yoga lembut untuk membangunkan tubuh dan melatih pernapasan di pagi hari.',
      image: 'assets/images/yoga-cover.jpg',
      duration: '15',
      difficulty: 'Beginner',
      calories: 80,
      steps: [
        'Mulai dengan posisi Child Pose selama 2 menit.',
        'Lakukan gerakan Cat-Cow untuk meregangkan punggung.',
        'Angkat pinggul ke posisi Downward Facing Dog.',
        'Langkahkan kaki ke depan untuk Warrior I.',
        'Akhiri dengan Savasana (berbaring rileks).'
      ]
    },
    {
      id: 2,
      type:'Chest',
      title: 'Full Body HIIT',
      description: 'Latihan intensitas tinggi tanpa alat untuk membakar lemak dengan cepat dan melatih jantung.',
      image: 'assets/images/hiit-cover.jpg',
      duration: '20',
      difficulty: 'Intermediate',
      calories: 250,
      steps: [
        'Pemanasan: Jumping Jacks (1 menit).',
        'Set 1: Burpees (30 detik) + Istirahat (15 detik).',
        'Set 2: Mountain Climbers (30 detik) + Istirahat (15 detik).',
        'Set 3: High Knees (30 detik) + Istirahat (15 detik).',
        'Pendinginan: Jalan di tempat dan peregangan.'
      ]
    },
    {
      id: 3,
      type:'Chest',
      title: 'Upper Body Strength',
      description: 'Fokus membentuk otot lengan, dada, dan bahu. Bisa menggunakan dumbbell atau berat badan sendiri.',
      image: 'assets/images/strength-cover.jpg',
      duration: '30',
      difficulty: 'Advanced',
      calories: 180,
      steps: [
        'Push-up standar: 3 set x 12 repetisi.',
        'Dumbbell Shoulder Press: 3 set x 10 repetisi.',
        'Tricep Dips (pakai kursi): 3 set x 15 repetisi.',
        'Bicep Curls: 3 set x 12 repetisi.',
        'Plank tahan 1 menit untuk stabilitas.'
      ]
    }
  ];

  //STATISTIC
  tabs = [
    { id: 'weight', label: 'Current Weight', value: '80 kg', icon: '⚖️', color: 'blue' },
    { id: 'calories', label: 'Calories Burn', value: '180 Kcal', icon: '🔥', color: 'red' },
    { id: 'duration', label: 'Duration', value: '120 min', icon: '⏱️', color: 'green' }
  ];

  getActiveTab() {
    return this.tabs.find(t => t.id === this.selectedChart);
  }

  getLabel(): string {
  switch (this.selectedChart) {
    case 'weight': return 'Weight';
    case 'calories': return 'Calories';
    case 'duration': return 'Duration';
    default: return 'Actual';
  }
}
  // 1. State Pilihan Chart (Default: Weight)
  public selectedChart: ChartCategory = 'weight';

  // 2. Data Master (4 Minggu Saja)
  // Target vs Actual untuk setiap kategori
  private chartDataMaster = {
    weight: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      actual: [85, 84.2, 83.5, 82.8],  // Berat turun (Bagus)
      target: [85, 84.0, 83.0, 82.0],  // Target turun lebih cepat
      color: '#3b82f6', // Blue
      bg: 'rgba(59, 131, 246, 0.79)',
      unit: 'kg'
    },
    calories: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      actual: [12000, 13500, 11000, 14200], // Total kalori seminggu
      target: [12500, 12500, 12500, 12500], // Target stabil
      color: '#ec8a00', // Orange
      bg: 'rgba(233, 89, 0, 0.84)',
      unit: 'kcal'
    },
    duration: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      actual: [180, 210, 150, 240], // Total menit seminggu
      target: [200, 200, 200, 200], // Target 200 menit/minggu
      color: '#84cc16', // Lime
      bg: 'rgba(137, 228, 0, 0.96)',
      unit: 'min'
    }
  };

  // 3. Konfigurasi Data Chart Awal
  public lineChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  // 4. Konfigurasi Options Chart
  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: { tension: 0.4 }, // Garis lengkung smooth
      point: { radius: 4, hoverRadius: 6 }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            let value = context.parsed.y;
            // Ambil unit dari data master yang sedang aktif
            let unit = this.chartDataMaster[this.selectedChart].unit; 
            return ` ${label}: ${value} ${unit}`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { 
        beginAtZero: false, // Biar grafik weight ga gepeng
        grid: { color: '#f3f4f6' } 
      }
    }
  };

  constructor() {
    // Load data awal saat komponen dibuat
    this.updateChartData();
  }

  // 5. Fungsi Switch Tab
  setChartType(type: ChartCategory) {
    this.selectedChart = type;
    this.updateChartData();
  }

  // 6. Logic Pembaruan Data
  private updateChartData() {
    const data = this.chartDataMaster[this.selectedChart];

    this.lineChartData = {
      labels: data.labels,
      datasets: [
        {
          // DATASET 1: ACTUAL (Garis Berwarna + Area)
          data: data.actual,
          label: 'Actual',
          borderColor: data.color,
          backgroundColor: (context: any) => {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) return null;

              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              
              // Gunakan opacity yang lebih tinggi (contoh: 0.6 atau 0.8) agar warna hijau terlihat padat
              gradient.addColorStop(0, data.bg); // Hijau Lime agak tebal di atas
              gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Tetap ada warna hijau tipis di bawah
  
              return gradient;
          },
          fill: true, // Isi warna di bawah garis
          pointBackgroundColor: data.color,
          pointBorderColor: '#fff',
          borderWidth: 2
        },
        {
          // DATASET 2: TARGET (Garis Putus-putus Abu)
          data: data.target,
          label: 'Target',
          borderColor: '#9ca3af', // Gray-400
          borderDash: [5, 5], // Garis putus-putus
          pointRadius: 0, // Titik target disembunyikan biar bersih
          pointHoverRadius: 0,
          fill: false,
          borderWidth: 2
        }
      ]
    };

    // Trigger update visual (kadang perlu di Angular)
    this.chart?.update();
  }
}