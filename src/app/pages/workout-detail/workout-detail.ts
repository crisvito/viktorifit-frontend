import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // 1. Tambah import Router
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.css',
})
export class WorkoutDetail implements OnInit {
  searchText = '';      
  workoutId: number | null = null;
  
  workout = {
    id: 1,
    type: 'Cardio Fitness',
    title: 'Running',
    duration: '80 minutes',
    calories: '180 Kcal',
    
    description: 'Lorem ipsum dolor sit amet ikan bakar ikan goreng suka makan kucing tapi kucingnya garong makanya ikannya jadi takut makan si kucing. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',

    steps: [
      { number: 1, text: 'Tubuh melakukan pemanasan simple agar tidak kaku' },
      { number: 2, text: 'Atur pernapasan dengan ritme yang stabil' },
      { number: 3, text: 'Mulai berlari dengan kecepatan rendah' },
      { number: 4, text: 'Tingkatkan kecepatan secara bertahap' },
      { number: 5, text: 'Jaga postur tubuh tetap tegak' },
      { number: 6, text: 'Lakukan pendinginan setelah berlari' },
      { number: 7, text: 'Lakukan peregangan otot setelah pendinginan' }
    ],

    equipments: [
      { name: 'Bench-Press', icon: '/assets/workout-detail/bench-press.svg' },
      { name: 'Dumbbell', icon: '/assets/workout-detail/dumbbell.svg' }
    ],

    otherTutorials: [
      { 
        id: 101, 
        title: 'Running', 
        type: 'Cardio', 
        duration: '1 Hour 30 Minutes', 
        image: '/assets/workout-lists/running-thumb.jpg' 
      },
      { 
        id: 102, 
        title: 'Yoga', 
        type: 'Flexibility', 
        duration: '45 Minutes', 
        image: '/assets/workout-lists/yoga-thumb.jpg' 
      },
      { 
        id: 103, 
        title: 'Cycling', 
        type: 'Cardio', 
        duration: '1 Hour', 
        image: '/assets/workout-lists/cycling-thumb.jpg' 
      }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router, // 2. Inject Router di sini
    private location: Location
  ) {}

  ngOnInit(): void {
    // Menangkap ID dari URL (misal: /workout-detail/1)
    this.route.paramMap.subscribe(params => {
      this.workoutId = +params.get('id')!;
      // Di sini nanti Anda bisa memanggil Service untuk mengambil data detail berdasarkan ID
    });
  }

  goBack(): void {
    this.location.back();
  }

  // 3. Logika Search: Pindah ke halaman List sambil membawa kata kunci
  onSearch() {
    if (this.searchText.trim().length > 0) {
      // Navigate ke '/workout-lists' dengan query params ?q=kata_kunci
      this.router.navigate(['/workout-lists'], { 
        queryParams: { q: this.searchText } 
      });
    } else {
      // Jika kosong, pindah ke list biasa tanpa filter
      this.router.navigate(['/workout-lists']);
    }
  }
}