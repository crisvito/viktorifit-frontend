import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/components';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as AOS from 'aos';

interface ServiceCard {
  title: string;
  description: string;
  icon: string;
  imagePlaceholder: string; // Nanti diganti path image dashboard kamu
}

interface FeatureCard {
  title: string;
  description: string;
  image: string; // Bisa diganti logic icon SVG
  color : string;
}

@Component({
  selector: 'app-home',        
  imports: [ButtonComponent, 
            CommonModule,
            RouterModule],
  templateUrl: './home.html',  
  styleUrls: ['./home.css'],
    
})

export class HomePage {

  constructor() { }
  slideWidth = 400;

  ngOnInit(): void {
    this.updateSlideWidth();
    AOS.init({
      duration: 1000, // Durasi animasi 1 detik
      once: true,     // Animasi cuma jalan sekali (biar ga pusing pas scroll naik-turun)
      offset: 50,    // Mulai animasi ketika elemen sudah 100px masuk layar
    });
  }

  features: FeatureCard[] = [
    {
      title: 'Flexible Scheduling',
      description: 'We offer flexible scheduling options to fit your busy lifestyle, allowing you to train whenever it suits you best.',
      image: '/pages/home/ourBenefits/Schedule.svg',
      color: 'green'
    },
    {
      title: 'AI-Powered Personalization',
      description: 'Leveraging advanced Machine Learning, our system analyzes your data to deliver workout programs specifically tailored to your unique fitness profile.',
      image: '/pages/home/ourBenefits/MachineLearning.svg',
      color: 'white'
    },
    {
      title: 'Completely Free of Charge',
      description: 'Access all of our premium features and expert-guided programs without any subscription fees or hidden costs.',
      image: '/pages/home/ourBenefits/Free.svg',
      color: 'green'
    },
  ];

  services: ServiceCard[] = [
    {
      title: 'Workout Calendar',
      description: 'Stay consistent by organizing your fitness routine. Plan your sessions ahead and never miss a workout day.',
      icon: '/pages/home/ourServices/Calendar.svg',
      imagePlaceholder: '/pages/home/workout_calendar.png'
    },
    {
      title: 'Body Tracker',
      description: 'Monitor your physical progress visually. Track your weight and body measurements to see your transformation.',
      icon: '/pages/home/ourServices/Statistic.svg',
      imagePlaceholder: '/pages/home/body_tracker.png'
    },
    {
      title: 'Workout History',
      description: 'Keep a complete log of your past activities. Review your performance history to celebrate how far you have come.',
      icon: '/pages/home/ourServices/History.svg',
      imagePlaceholder: '/pages/home/workout_history.png'
    },
    {
      title: 'Tutorials',
      description: 'Master every move with detailed guides. Learn proper forms and techniques to maximize results and prevent injury.',
      icon: '/pages/home/ourServices/Tutorials.svg',
      imagePlaceholder: '/pages/home/workout_tutorials.png'
    },
    {
      title: 'Recommendation',
      description: 'Get personalized workout suggestions tailored to your current condition and goals, powered by our smart Machine Learning.',
      icon: '/pages/home/ourServices/Recommendation.svg',
      imagePlaceholder: '/pages/home/workout_recommendation.png'
      }
    ];

  @ViewChild('programSlider') slider!: ElementRef;
  @HostListener('window:resize')
    onResize() {
      this.updateSlideWidth();
    }

    updateSlideWidth() {
      this.slideWidth = window.innerWidth < 768 ? 370 : 430;
    }
  // 2. Data Program (Biar gampang editnya)
  ourPrograms = [
    { title: 'Muscle Gain', 
      desc: 'Maximize your strength and hypertrophy with routines specifically designed to push your limits and build solid muscle mass.', 
      image: '/global/workout-type/muscleGain_transparent_background.svg', 
      theme: 'white' },

    { title: 'Weight Loss', 
      desc: 'Torch calories and boost your metabolism through high-intensity sessions focused on sustainable fat loss and endurance.', 
      image: '/global/workout-type/weightLoss_transparent_background.svg', 
      theme: 'white' },

    { title: 'Maintain', 
      desc: 'Balance is key. Keep your current fitness level steady while improving flexibility, mobility, and overall daily energy.', 
      image: '/global/workout-type/maintain_transparent_background.svg', 
      theme: 'white' }
  ];

  activeIndex = 0;

  // 3. Fungsi Geser
navigasiSlider(arah: 'kiri' | 'kanan') {
  if (arah === 'kanan') {
    if (this.activeIndex < this.ourPrograms.length - 1) {
      this.activeIndex++;
    } else {
      this.activeIndex = 0; // Balik ke awal
    }
  } else {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    } else {
      this.activeIndex = this.ourPrograms.length - 1; // Ke akhir
    }
  }

  this.scrollToActive();
}

scrollToActive() {
  const box = this.slider.nativeElement;
  const cards = box.children;
  const targetCard = cards[this.activeIndex] as HTMLElement;

  if (targetCard) {
    // 1. Hitung titik tengah container
    const containerCenter = box.clientWidth / 2;
    
    // 2. Hitung titik tengah kartu target
    const cardCenter = targetCard.clientWidth / 2;

    // 3. RUMUS UTAMA (Ini yang mengatur posisi berhenti)
    // Logika: Cari posisi kartu, kurangi posisi box, lalu sesuaikan biar pas di tengah
    let position = targetCard.offsetLeft - box.offsetLeft - (containerCenter - cardCenter);

    // --- CARA NGATUR PERGESERANNYA ---
    
    // Opsi A: Kalau mau geser lebih ke KIRI dikit (biar kartu aktif agak ke kanan)
    // position = position + 50; 

    // Opsi B: Kalau mau geser lebih ke KANAN dikit (biar kartu aktif agak ke kiri)
    // position = position - 50;
    
    // Opsi C: Kalau mau kartu aktif SELALU MENTOK di KIRI (bukan di tengah)
    // position = targetCard.offsetLeft - box.offsetLeft - 20; // 20 itu padding
    
    // Eksekusi geser
    box.scrollTo({
      left: position,
      behavior: 'smooth'
    });
  }
}
}