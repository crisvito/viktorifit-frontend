import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';

// 1. IMPORT CHART DAN REGISTERABLES (PAKET LENGKAP)
import { 
  Chart, 
  ChartConfiguration, 
  ChartOptions, 
  ScriptableContext, 
  Plugin,
  registerables // <--- Ini kuncinya, isinya semua modul (Category, Linear, dll)
} from 'chart.js';

// 2. DAFTARKAN LANGSUNG DI SINI (DI LUAR CLASS)
// Agar tereksekusi sebelum halaman apapun dimuat
Chart.register(...registerables);

const customChartEffectsPlugin: Plugin<'line'> = {
  id: 'customChartEffects',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea: { top, bottom, left, right } } = chart;
    ctx.save();

    // Gambar Sumbu X dan Y Custom
    ctx.beginPath();
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = '#9CA3AF'; 
    ctx.setLineDash([]); 

    ctx.moveTo(left, bottom);
    ctx.lineTo(left, top - 20); 

    ctx.moveTo(left, bottom);
    ctx.lineTo(right + 20, bottom); 
    ctx.stroke();

    // Gambar Garis Vertikal Penunjuk Data Terakhir
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (datasetIndex === 0 && chart.isDatasetVisible(datasetIndex)) {
        const meta = chart.getDatasetMeta(datasetIndex);
        if (meta.data.length > 0) {
            const lastDataPoint = meta.data[meta.data.length - 1];
            if (lastDataPoint) {
              ctx.beginPath();
              ctx.lineWidth = 1; 
              ctx.strokeStyle = (dataset.borderColor as string) || '#757575';
              ctx.setLineDash([]); 
              
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
  selectedMonthIndex: number = 1; 
  selectedYear: number = 2026;
  tempMonthIndex: number = 0;
  tempYear: number = 0;
  
  allActivities: any[] = [];
  selectedStat: string = 'weights';
  currentTheme = { color: '#AFFA01', gradientStart: 'rgba(175, 250, 1, 0.25)' };

  readonly MOCK_DATABASE = [
    { type: 'Cardio', duration: 15, calories: 100, weight: 85.5 },
    { type: 'Gym', duration: 20, calories: 150, weight: 85.0 },
    { type: 'Swimming', duration: 10, calories: 80, weight: 84.8 },
    { type: 'Yoga', duration: 25, calories: 120, weight: 84.5 },
    { type: 'Gym', duration: 90, calories: 500, weight: 75.0 },
    { type: 'Cardio', duration: 60, calories: 400, weight: 75.2 },
    { type: 'Swimming', duration: 80, calories: 600, weight: 74.8 },
    { type: 'Gym', duration: 100, calories: 700, weight: 75.5 },
    { type: 'Cardio', duration: 120, calories: 800, weight: 74.5 },
    { type: 'Yoga', duration: 60, calories: 300, weight: 75.0 },
    { type: 'Swimming', duration: 90, calories: 650, weight: 74.9 },
    { type: 'Gym', duration: 110, calories: 750, weight: 75.1 },
  ];

  statCards = [
    { id: 'duration', title: 'Duration', value: '0 mins', icon: '/pages/statistic/duration.svg', change: '0%', changeText: 'From last month', isPositive: false },
    { id: 'weights', title: 'Weights', value: '0 kg', icon: '/pages/statistic/weights.svg', change: '0%', changeText: 'From last month', isPositive: false },
    { id: 'calories', title: 'Calories Burn', value: '0 cal', icon: '/pages/statistic/calories.svg', change: '0%', changeText: 'From last month', isPositive: false }
  ];

  topActivities: any[] = [];
  donutSegments: { dashArray: string, dashOffset: number }[] = [];
  readonly CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 40; 
  readonly SEGMENT_GAP = 2;

  public lineChartData: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  public lineChartType: 'line' = 'line'; 
  public lineChartPlugins = [customChartEffectsPlugin];
  
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { top: 40, bottom: 10, left: 0, right: 60 } },
    
    // FIX INTERAKSI: Agar sidebar lancar diklik
    interaction: { 
        mode: 'nearest', 
        axis: 'x', 
        intersect: false 
    },
    // Batasi event agar tidak berat
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    
    elements: {
      line: { tension: 0 },
      point: { radius: 0, hitRadius: 20, hoverRadius: 6 }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { family: "'Poppins', sans-serif", size: 13, weight: 'bold' },
        bodyFont: { family: "'Poppins', sans-serif", size: 12 },
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context: any) => ` ${context.dataset.label}: ${context.parsed.y} ${this.getUnit()}`
        }
      },
    },
    scales: {
      x: { 
        type: 'category', // Wajib ada
        border: { display: false }, 
        grid: { display: false }, 
        ticks: { color: '#9ca3af', font: { family: "'Poppins', sans-serif", size: 11 }, padding: 15 } 
      },
      y: { 
        min: 0, 
        grace: '20%', 
        border: { display: false }, 
        grid: { color: '#f3f4f6', tickLength: 0 }, 
        ticks: { color: '#9ca3af', font: { family: "'Poppins', sans-serif", size: 11 }, maxTicksLimit: 6, padding: 20, callback: (value) => value + ' ' + this.getUnit() } 
      }
    }
  };

  constructor(private cd: ChangeDetectorRef) { 
    this.generateYears(); 
  }

  ngOnInit() {
    this.allActivities = this.generateMockData();
    this.updateStatistics();
  }

  selectStat(id: string) { 
    this.selectedStat = id; 
    this.updateStatistics(); 
  }
  
  getStatLabel(): string { if (this.selectedStat === 'duration') return 'Duration'; if (this.selectedStat === 'calories') return 'Calories'; return 'Weight'; }
  getUnit(): string { if (this.selectedStat === 'duration') return 'm'; if (this.selectedStat === 'calories') return 'kcal'; return 'kg'; }

  updateStatistics() {
    const currentMonthData = this.allActivities.filter(item => 
      item.date.getMonth() === this.selectedMonthIndex && 
      item.date.getFullYear() === this.selectedYear
    );

    let prevMonthIndex = this.selectedMonthIndex - 1;
    let prevYear = this.selectedYear;
    if (prevMonthIndex < 0) { prevMonthIndex = 11; prevYear -= 1; }

    const prevMonthData = this.allActivities.filter(item => 
      item.date.getMonth() === prevMonthIndex && 
      item.date.getFullYear() === prevYear
    );

    this.calculateCards(currentMonthData, prevMonthData);
    this.calculateTopActivities(currentMonthData); 
    
    const weeklyData = this.getWeeklyData(this.selectedMonthIndex, this.selectedYear);
    this.calculateChart(weeklyData);
    
    this.cd.detectChanges();
  }

  calculateCards(currData: any[], prevData: any[]) {
    const sum = (data: any[], key: string) => data.reduce((acc, item) => acc + item[key], 0);
    const avg = (data: any[], key: string) => {
        const validItems = data.filter(i => i[key] > 0);
        return validItems.length ? Math.round(validItems.reduce((acc, item) => acc + item[key], 0) / validItems.length) : 0;
    };

    const currDur = sum(currData, 'duration');
    const prevDur = sum(prevData, 'duration');
    this.updateCardValue('duration', `${currDur} mins`, currDur, prevDur);

    const currCal = sum(currData, 'calories');
    const prevCal = sum(prevData, 'calories');
    this.updateCardValue('calories', `${currCal} cal`, currCal, prevCal);

    const currW = avg(currData, 'weight');
    const prevW = avg(prevData, 'weight');
    this.updateCardValue('weights', `${currW} kg`, currW, prevW);

    const activeCard = this.statCards.find(c => c.id === this.selectedStat);
    if (activeCard) {
      this.currentTheme = activeCard.isPositive 
        ? { color: '#AFFA01', gradientStart: 'rgba(175, 250, 1, 0.25)' }
        : { color: '#E10000', gradientStart: 'rgba(225, 0, 0, 0.25)' };
    }
  }

  updateCardValue(id: string, val: string, curr: number, prev: number) {
    const card = this.statCards.find(c => c.id === id);
    if (card) {
        card.value = val;
        let diff = 0;
        if (prev > 0) diff = ((curr - prev) / prev) * 100;
        else if (curr > 0) diff = 100;
        
        card.change = (diff >= 0 ? '+' : '') + Math.round(diff) + '%';
        card.isPositive = diff >= 0; 
    }
  }

  getWeeklyData(monthIndex: number, year: number) {
    const result = { duration: [0,0,0,0], calories: [0,0,0,0], weight: [0,0,0,0], counts: [0,0,0,0] };
    const monthData = this.allActivities.filter(item => item.date.getMonth() === monthIndex && item.date.getFullYear() === year);
    monthData.forEach(item => {
        const d = item.date.getDate();
        let idx = d <= 7 ? 0 : d <= 14 ? 1 : d <= 21 ? 2 : 3;
        result.duration[idx] += item.duration;
        result.calories[idx] += item.calories;
        if (item.weight > 0) { result.weight[idx] += item.weight; result.counts[idx]++; }
    });
    for(let i=0; i<4; i++) {
        if(result.counts[i] > 0) result.weight[i] = Math.round(result.weight[i] / result.counts[i]);
        else if (i > 0) result.weight[i] = result.weight[i-1];
    }
    return result;
  }

  calculateTopActivities(data: any[]) {
    const durationSums: {[key: string]: number} = {}; let totalDuration = 0;
    data.forEach(item => { if (item.duration > 0) { durationSums[item.type] = (durationSums[item.type] || 0) + item.duration; totalDuration += item.duration; } });
    let sorted = Object.keys(durationSums).map(key => ({ name: key, count: durationSums[key] })).sort((a, b) => b.count - a.count);
    let finalActivities = sorted.slice(0, 3);
    const othersCount = sorted.slice(3).reduce((acc, curr) => acc + curr.count, 0);
    if (othersCount > 0) finalActivities.push({ name: 'Others', count: othersCount });
    
    const chartColors = ['url(#gradRed)', 'url(#gradYellow)', 'url(#gradGreen)', 'url(#gradBlue)'];
    const legendColors = ['#FFB0A4', '#EDE689', '#AFFA01', '#93C5FD'];
    this.topActivities = finalActivities.map((item, index) => ({ name: item.name, count: item.count, percent: totalDuration ? Math.round((item.count / totalDuration) * 100) + '%' : '0%', chartColor: chartColors[index] || 'url(#gradBlue)', legendColor: legendColors[index] || '#3B82F6' }));
    this.calculateDonutSegments();
  }

  calculateDonutSegments() {
    this.donutSegments = []; let acc = 0; const total = this.topActivities.reduce((a, c) => a + c.count, 0);
    if (total === 0) { this.donutSegments = Array(4).fill({ dashArray: `0 ${this.CIRCLE_CIRCUMFERENCE}`, dashOffset: 0 }); return; }
    this.topActivities.forEach(act => {
        const ratio = act.count / total; let len = ratio * this.CIRCLE_CIRCUMFERENCE;
        if (len > 0) len = Math.max(0, len - this.SEGMENT_GAP);
        this.donutSegments.push({ dashArray: `${len} ${this.CIRCLE_CIRCUMFERENCE - len}`, dashOffset: -acc * this.CIRCLE_CIRCUMFERENCE });
        acc += ratio;
    });
  }

  calculateChart(weekData: any) {
    let dataset = this.selectedStat === 'weights' ? weekData.weight : (this.selectedStat === 'calories' ? weekData.calories : weekData.duration);
    const avgVal = dataset.reduce((a:any, b:any) => a + b, 0) / 4 || 60;
    this.lineChartData = {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            { 
              data: dataset, label: `Your ${this.getStatLabel()}`, 
              backgroundColor: (ctx: ScriptableContext<'line'>) => {
                const { ctx: canvasCtx, chartArea } = ctx.chart; if (!chartArea) return;
                const grad = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                grad.addColorStop(0.65, this.currentTheme.gradientStart); grad.addColorStop(1, 'rgba(255, 255, 255, 0)'); return grad;
              },
              borderColor: this.currentTheme.color, borderWidth: 2, fill: true, pointBackgroundColor: this.currentTheme.color, pointBorderColor: '#fff', pointBorderWidth: 2, 
              pointRadius: dataset.map((_:any, i:number) => i === 3 ? 6 : 3), tension: 0 
            },
            { data: [avgVal, avgVal, avgVal, avgVal], label: 'Target', borderDash: [5.5], borderColor: '#9CA3AF', borderWidth: 2, fill: false, pointRadius: 0, tension: 0 }
        ]
    };
  }

  generateMockData() { const data = []; const now = new Date(); for (let i = 0; i < 90; i++) { const date = new Date(); date.setDate(now.getDate() - i); const dbItem = this.MOCK_DATABASE[i % this.MOCK_DATABASE.length]; data.push({ date, ...dbItem }); } return data; }
  generateYears() { const currentYear = new Date().getFullYear(); for (let y = currentYear - 5; y <= currentYear + 2; y++) this.yearsList.push(y); }
  
  openPeriodModal() { 
    this.tempMonthIndex = this.selectedMonthIndex; 
    this.tempYear = this.selectedYear; 
    this.isPeriodModalOpen = true; 
    setTimeout(() => this.scrollToActive(), 100); 
  }
  
  closePeriodModal() { 
    this.isPeriodModalOpen = false; 
    this.cd.detectChanges(); 
  }
  
  applyPeriodSelection() { 
    this.selectedMonthIndex = this.tempMonthIndex; 
    this.selectedYear = this.tempYear; 
    this.closePeriodModal(); 
    this.updateStatistics(); 
  }
  
  onScrollMonth(e: any) { const idx = Math.round(e.target.scrollTop / 40); if (idx >= 0 && idx < 12) this.tempMonthIndex = idx; }
  onScrollYear(e: any) { const idx = Math.round(e.target.scrollTop / 40); if (idx >= 0 && idx < this.yearsList.length) this.tempYear = this.yearsList[idx]; }
  scrollToActive() { const m = document.getElementById('monthContainer'); const y = document.getElementById('yearContainer'); if (m) m.scrollTop = this.tempMonthIndex * 40; if (y) y.scrollTop = this.yearsList.indexOf(this.tempYear) * 40; }
}