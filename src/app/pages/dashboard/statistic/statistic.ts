import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { 
  Chart, 
  ChartConfiguration, 
  ChartOptions, 
  ScriptableContext, 
  Plugin,
  registerables 
} from 'chart.js';

Chart.register(...registerables);

// Plugin Custom untuk efek garis vertikal pada chart
const customChartEffectsPlugin: Plugin<'line'> = {
  id: 'customChartEffects',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: { top, bottom, left, right } } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = '#9CA3AF'; 
    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top - 20); 
    ctx.moveTo(left, bottom);
    ctx.lineTo(right + 20, bottom); 
    ctx.stroke();

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (datasetIndex === 0 && chart.isDatasetVisible(datasetIndex)) {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.data.length > 0) {
            const lastDataPoint = meta.data[meta.data.length - 1];
            if (lastDataPoint) {
              ctx.beginPath();
              ctx.lineWidth = 1; 
              ctx.strokeStyle = (dataset.borderColor as string) || '#757575';
              ctx.moveTo(lastDataPoint.x, lastDataPoint.y);
              ctx.lineTo(lastDataPoint.x, bottom);
              ctx.stroke();
            }
        }
      }
    });
    ctx.restore();
  }
};

@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './statistic.html',
  styleUrl: './statistic.css'
})
export class StatisticPage implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  isPeriodModalOpen = false;
  monthsList = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
  yearsList: number[] = [];
  selectedMonthIndex: number = new Date().getMonth(); 
  selectedYear: number = new Date().getFullYear();
  tempMonthIndex: number = 0;
  tempYear: number = 0;
  
  readyData: any = null; // Data yang sudah Enriched
  selectedStat: string = 'weights';
  currentTheme = { color: '#AFFA01', gradientStart: 'rgba(175, 250, 1, 0.25)' };

  statCards = [
    { id: 'duration', title: 'Duration', value: '0 mins', icon: '/pages/statistic/duration.svg', change: '0%', changeText: 'From initial', isPositive: true },
    { id: 'weights', title: 'Weights', value: '0 kg', icon: '/pages/statistic/weights.svg', change: '0%', changeText: 'Target weight', isPositive: true },
    { id: 'calories', title: 'Daily Calories', value: '0 cal', icon: '/pages/statistic/calories.svg', change: '0%', changeText: 'Daily plan', isPositive: true }
  ];

  topActivities: any[] = [];
  donutSegments: { dashArray: string, dashOffset: number }[] = [];
  readonly CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 40; 

  public lineChartData: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  public lineChartType: 'line' = 'line'; 
  public lineChartPlugins = [customChartEffectsPlugin];
  
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 40, bottom: 10, left: 0, right: 60 } },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    elements: { line: { tension: 0.4 }, point: { radius: 0, hitRadius: 20, hoverRadius: 6 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { family: "'Poppins', sans-serif", size: 13, weight: 'bold' },
        padding: 12,
        callbacks: { label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y} ${this.getUnit()}` }
      },
    },
    scales: {
      x: { type: 'category', grid: { display: false }, ticks: { color: '#9ca3af', padding: 15 } },
      y: { border: { display: false }, grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af', maxTicksLimit: 6, padding: 20, callback: (v) => v + ' ' + this.getUnit() } }
    }
  };

  constructor(private cd: ChangeDetectorRef) { this.generateYears(); }

  ngOnInit() {
    // 1. AMBIL DATA DARI 'ml_data_ready' (Optimized Source)
    const data = localStorage.getItem('ml_data_ready');
    
    if (data) {
      this.readyData = JSON.parse(data);
      this.updateStatistics();
    } else {
        // Fallback jika user langsung loncat ke halaman statistic tanpa lewat dashboard
        // (Jarang terjadi, tapi untuk safety)
        const rawData = localStorage.getItem('ml_result');
        if (rawData) {
            this.readyData = JSON.parse(rawData);
            this.updateStatistics();
        }
    }
  }

  selectStat(id: string) { 
    this.selectedStat = id; 
    this.updateStatistics(); 
  }
  
  getStatLabel(): string { 
    return this.selectedStat === 'duration' ? 'Duration' : this.selectedStat === 'calories' ? 'Calories' : 'Weight'; 
  }

  getUnit(): string { 
    return this.selectedStat === 'duration' ? 'm' : this.selectedStat === 'calories' ? 'kcal' : 'kg'; 
  }

  updateStatistics() {
    if (!this.readyData) return;

    const profile = this.readyData.userProfile;
    const roadmap = this.readyData.progressRecommendation?.roadmap || [];
    
    // 1. Hitung Card Values
    this.calculateCards(profile, roadmap);

    // 2. Hitung Top Activities (diambil dari rekomendasi workout)
    this.calculateTopActivities();

    // 3. Update Chart berdasarkan Roadmap (Week 1 - Week 12)
    this.calculateChart(roadmap, profile);

    this.cd.detectChanges();
  }

  calculateCards(profile: any, roadmap: any[]) {
    const currentWeek = roadmap[0] || {};
    const finalWeek = roadmap[roadmap.length - 1] || {};

    // Duration
    const durVal = profile.duration || 60;
    this.statCards[0].value = `${durVal} mins`;
    this.statCards[0].change = `+0%`; 

    // Weight (Target Week 12)
    const targetW = finalWeek.physical?.weight_kg || profile.weight;
    this.statCards[1].value = `${targetW} kg`;
    const wDiff = ((targetW - profile.weight) / profile.weight) * 100;
    this.statCards[1].change = `${wDiff > 0 ? '+' : ''}${wDiff.toFixed(1)}%`;
    this.statCards[1].isPositive = targetW <= profile.weight; 

    // Calories
    const calVal = currentWeek.nutrition?.calories || 2000;
    this.statCards[2].value = `${calVal} cal`;
    this.statCards[2].changeText = 'Today Calories';

    // Theme Color
    const activeCard = this.statCards.find(c => c.id === this.selectedStat);
    this.currentTheme = (this.selectedStat === 'weights' && targetW > profile.weight) || activeCard?.isPositive 
      ? { color: '#AFFA01', gradientStart: 'rgba(175, 250, 1, 0.25)' }
      : { color: '#3b82f6', gradientStart: 'rgba(59, 130, 246, 0.25)' };
  }

  calculateChart(roadmap: any[], profile: any) {
    const labels = roadmap.map(w => `W${w.week}`);
    let targetData: number[] = [];

    if (this.selectedStat === 'weights') {
      targetData = roadmap.map(w => w.physical.weight_kg);
    } else if (this.selectedStat === 'calories') {
      targetData = roadmap.map(w => w.nutrition.calories);
    } else {
      targetData = roadmap.map(() => profile.duration || 60);
    }

    this.lineChartData = {
      labels: labels,
      datasets: [
        { 
          data: targetData, 
          label: `Actual ${this.getStatLabel()}`, 
          borderColor: this.currentTheme.color,
          backgroundColor: (ctx) => {
            const chartArea = ctx.chart.chartArea;
            if (!chartArea) return;
            const grad = ctx.chart.ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            grad.addColorStop(0, this.currentTheme.gradientStart);
            grad.addColorStop(1, 'transparent');
            return grad;
          },
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: this.currentTheme.color
        },
      ]
    };
    if(this.chart) this.chart.update();
  }

  calculateTopActivities() {
    // Mengambil kategori otot dari rekomendasi workout home
    // Safe access (?.) karena 'home' mungkin ada tapi 'workout_plan' bisa jadi null (meski jarang untuk home)
    const workoutPlan = this.readyData.workoutRecommendation?.home?.workout_plan; 
    
    if (!workoutPlan) {
        this.topActivities = [];
        return;
    }

    const firstDayKey = Object.keys(workoutPlan)[0];
    const exercises = workoutPlan[firstDayKey] || [];

    const categories: any = {};
    exercises.forEach((ex: any) => {
      categories[ex.muscle_group] = (categories[ex.muscle_group] || 0) + 1;
    });

    const total = exercises.length;
    // Map data untuk UI
    this.topActivities = Object.keys(categories).map((name, i) => ({
      name: name,
      count: categories[name],
      percent: total > 0 ? Math.round((categories[name] / total) * 100) + '%' : '0%',
      chartColor: ['url(#gradGreen)', 'url(#gradBlue)', 'url(#gradYellow)', 'url(#gradRed)'][i % 4],
      legendColor: ['#AFFA01', '#3B82F6', '#FFF492', '#FF3F3F'][i % 4]
    })).slice(0, 4);

    this.calculateDonutSegments();
  }

  calculateDonutSegments() {
    this.donutSegments = [];
    let acc = 0;
    const total = this.topActivities.reduce((a, c) => a + c.count, 0);
    
    if (total === 0) return;

    this.topActivities.forEach(act => {
      const ratio = act.count / total;
      const len = ratio * this.CIRCLE_CIRCUMFERENCE;
      this.donutSegments.push({
        dashArray: `${len} ${this.CIRCLE_CIRCUMFERENCE}`,
        dashOffset: -acc * this.CIRCLE_CIRCUMFERENCE
      });
      acc += ratio;
    });
  }

  // --- UI Helpers (Tahun/Bulan Modal) ---
  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 1; y <= currentYear + 1; y++) this.yearsList.push(y);
    this.tempYear = this.selectedYear;
  }

  openPeriodModal() { this.tempMonthIndex = this.selectedMonthIndex; this.tempYear = this.selectedYear; this.isPeriodModalOpen = true; setTimeout(() => this.scrollToActive(), 100); }
  closePeriodModal() { this.isPeriodModalOpen = false; }
  applyPeriodSelection() { this.selectedMonthIndex = this.tempMonthIndex; this.selectedYear = this.tempYear; this.closePeriodModal(); }
  onScrollMonth(e: any) { this.tempMonthIndex = Math.round(e.target.scrollTop / 40); }
  onScrollYear(e: any) { const idx = Math.round(e.target.scrollTop / 40); this.tempYear = this.yearsList[idx]; }
  scrollToActive() { 
    const m = document.getElementById('monthContainer'); 
    const y = document.getElementById('yearContainer'); 
    if (m) m.scrollTop = this.tempMonthIndex * 40; 
    if (y) y.scrollTop = this.yearsList.indexOf(this.tempYear) * 40; 
  }
}