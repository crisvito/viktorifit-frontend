import { Component, ElementRef, ViewChild } from '@angular/core';
import { ButtonComponent } from '../../shared/components';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface ServiceCard {
  title: string;
  description: string;
  iconType: 'calendar' | 'chart' | 'history' | 'video' | 'bulb';
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
  styleUrls: ['./home.css']    
})

export class HomePage {

  features: FeatureCard[] = [
    {
      title: 'Flexible Scheduling',
      description: 'We offer flexible scheduling options to fit your busy lifestyle. Whether you prefer morning yoga or evening workshops.',
      image: 'calendar',
      color:'green'
    },
    {
      title: 'Personalized Programs',
      description: 'We understand that everyone’s wellness journey is unique. Our personalized programs are tailored to your individual needs.',
      image: 'user',
      color:'white'
    },
    {
      title: 'Expert Instructors',
      description: 'Our team of certified and experienced instructors is dedicated to helping you achieve your fitness and wellness goals.',
      image: 'group',
      color:'green'
    },
  ]

  services: ServiceCard[] = [
    {
      title: 'Workout Calendar',
      description: 'Kami menghadirkan 5 service utama yang akan membuat pengalaman terbaik mu dalam berolahraga.',
      iconType: 'calendar',
<<<<<<< HEAD
      imagePlaceholder: '/assets/home/workout_calendar.png'
=======
      imagePlaceholder: '/pages/home/workout_calendar.png'
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
    },
    {
      title: 'Body Tracker',
      description: 'Kami menghadirkan 5 service utama yang akan membuat pengalaman terbaik mu dalam berolahraga.',
      iconType: 'chart',
<<<<<<< HEAD
      imagePlaceholder: '/assets/home/body_tracker.png'
=======
      imagePlaceholder: '/pages/home/body_tracker.png'
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
    },
    {
      title: 'Workout History',
      description: 'Kami menghadirkan 5 service utama yang akan membuat pengalaman terbaik mu dalam berolahraga.',
      iconType: 'history',
<<<<<<< HEAD
      imagePlaceholder: '/assets/home/workout_history.png'
=======
      imagePlaceholder: '/pages/home/workout_history.png'
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
    },
    {
      title: 'Tutorials',
      description: 'Kami menghadirkan 5 service utama yang akan membuat pengalaman terbaik mu dalam berolahraga.',
      iconType: 'video',
<<<<<<< HEAD
      imagePlaceholder: '/assets/home/workout_tutorials.png'
=======
      imagePlaceholder: '/pages/home/workout_tutorials.png'
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
    },
    {
      title: 'Recommendation',
      description: 'Kami menghadirkan 5 service utama yang akan membuat pengalaman terbaik mu dalam berolahraga.',
      iconType: 'bulb',
<<<<<<< HEAD
      imagePlaceholder: '/assets/home/workout_recommendation.png'
=======
      imagePlaceholder: '/pages/home/workout_recommendation.png'
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
      }
    ];

  // 1. Ambil referensi elemen slider dari HTML
  @ViewChild('programSlider') slider!: ElementRef;

  // 2. Data Program (Biar gampang editnya)
  ourPrograms = [
    { title: 'Muscle Gain', desc: 'Bakar kalori lebih maksimal.', image: '🔥', theme: 'white' },
    { title: 'Weight Loss', desc: 'Bangun otot lebih kuat.', image: '💪', theme: 'white' },
    { title: 'Maintain', desc: 'Lenturkan tubuh & pikiran.', image: '🧘', theme: 'white' }
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