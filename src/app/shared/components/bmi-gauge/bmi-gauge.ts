import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bmi-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bmi-gauge.html', // Pastikan nama file html benar
})
export class BmiGaugeComponent implements OnChanges {
  @Input() bmiScore: number = 0;

  // --- Konfigurasi Visual ---
  radius = 120;
  strokeWidth = 35;
  centerX = 160;
  centerY = 180;
  
  // 1. DEFINISIKAN TOTAL ANGLE DISINI (Supaya bisa dipanggil pakai 'this')
  totalAngle = 240; 

  // --- State untuk View ---
  emojiX = 0;
  emojiY = 0;
  emojiIcon = '😐';
  currentCategory = 'Normal';
  currentColor = '#000';

  segments = [
    { min: 0,    max: 18.5, color: '#FCD34D', label: 'Underweight' },
    { min: 18.5, max: 25,   color: '#84CC16', label: 'Normal' },
    { min: 25,   max: 30,   color: '#FBBF24', label: 'Overweight' },
    { min: 30,   max: 40,   color: '#F87171', label: 'Obese' }
  ];

  separators = [18.5, 25, 30];

  ngOnChanges(changes: SimpleChanges): void {
    // Cek apakah input 'bmiScore' yang berubah
    if (changes['bmiScore']) {
      const nilaiBaru = changes['bmiScore'].currentValue;
      console.log('Gauge menerima nilai baru:', nilaiBaru);
      
      // Panggil fungsi untuk update jarum/grafik di sini
      this.updateGauge(nilaiBaru);
    }
  }


  ngOnInit() {
    this.updateGauge(this.bmiScore);
  }

  updateGauge(score:number) {
    this.calculateEmojiPosition(score);
    this.determineStatus(score);
  }

  // --- FUNGSI MATEMATIKA ---

  polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    // Hitung offset agar grafik 270 derajat tetap seimbang di tengah atas (Jam 12)
    // Rumus: (TotalAngle / 2) + 90
    // (270 / 2) + 90 = 135 + 90 = 225
    const angleOffset = (this.totalAngle / 2) + 90;
    
    const angleInRadians = (angleInDegrees - angleOffset) * Math.PI / 180.0;
    
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }

  getArcPath(index: number): string {
    const maxBmi = 40;
    const seg = this.segments[index];
    const gap = 2;

    // Gunakan this.totalAngle
    let startDeg = (seg.min / maxBmi) * this.totalAngle;
    let endDeg = (seg.max / maxBmi) * this.totalAngle;

    if (index < this.segments.length - 1) {
      endDeg -= gap;
    }

    return this.describeArc(this.centerX, this.centerY, this.radius, startDeg, endDeg);
  }

  getSeparatorPosition(val: number) {
    const maxBmi = 40;
    
    // Gunakan this.totalAngle
    const angle = (val / maxBmi) * this.totalAngle;
    
    const pos = this.polarToCartesian(this.centerX, this.centerY, this.radius + 35, angle);
    
    // Hitung rotasi text agar mengikuti lengkungan
    // Logic rotasi disesuaikan dengan offset 270 derajat
    const angleOffset = (this.totalAngle / 2) + 90;
    const rotation = angle - angleOffset + 90; 

    return { x: pos.x, y: pos.y, rotation: rotation };
  }

  calculateEmojiPosition(score:number) {
    const maxBmi = 40;
    const safeScore = Math.min(Math.max(score, 0), maxBmi);
    
    // 2. PERBAIKAN DISINI: Jangan pakai 180, pakai this.totalAngle (270)
    const angle = (safeScore / maxBmi) * this.totalAngle;

    const pos = this.polarToCartesian(this.centerX, this.centerY, this.radius, angle);
    
    this.emojiX = pos.x;
    this.emojiY = pos.y;
  }

  determineStatus(score:number) {
    const activeSeg = this.segments.find(s => score >= s.min && score < s.max) || this.segments[this.segments.length - 1];
    this.currentCategory = activeSeg.label;
    
    // Pastikan path assets sesuai dengan projectmu
    if (this.currentCategory === 'Underweight') {
        this.currentColor = 'text-yellow-600'; 
        this.emojiIcon = 'assets/bmi-gauge/flat.png';
    } else if (this.currentCategory === 'Normal') {
        this.currentColor = 'text-green-600';
        this.emojiIcon = 'assets/bmi-gauge/happy.png';
    } else if (this.currentCategory === 'Overweight') {
        this.currentColor = 'text-yellow-700';
        this.emojiIcon = 'assets/bmi-gauge/flat.png';
    } else {
        this.currentColor = 'text-red-600';
        this.emojiIcon = 'assets/bmi-gauge/angry.png';
    }
  }
}