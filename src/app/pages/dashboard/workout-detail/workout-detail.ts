import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../../core/services/exercise.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './workout-detail.html',
  styleUrl: './workout-detail.css',
})
export class WorkoutDetail implements OnInit {
  searchText = '';
  workoutId: string | null = null;
  workout: any = {
    steps: [],
    equipments: [],
    otherTutorials: []
  };
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.workoutId = params.get('id');
      if (this.workoutId) {
        this.fetchWorkoutDetail(this.workoutId);
      }
    });
  }

  /**
   * SAPU JAGAT CLEANER
   * Membersihkan format: • ['body weight \n • chair'] -> ["body weight", "chair"]
   */
  private cleanToArray(val: any): string[] {
    if (!val) return [];
    
    // Ubah ke string dulu jika formatnya aneh
    let str = Array.isArray(val) ? val.join(', ') : String(val);

    return str
      .replace(/[\[\]']/g, '')         // Hapus [ ] dan '
      .replace(/•/g, '')               // Hapus bullet points •
      .replace(/[\r\n]+/g, ', ')       // Ganti baris baru jadi koma
      .split(',')                      // Pecah jadi array
      .map(item => item.trim())        // Bersihkan spasi
      .filter(item => item.length > 0);// Buang yang kosong
  }

  fetchWorkoutDetail(id: string) {
    this.isLoading = true;
    this.exerciseService.getExerciseById(id).subscribe({
      next: (data) => {
        // Mendeteksi data equipment (cek tunggal atau jamak dari API)
        const rawEquips = this.cleanToArray(data.equipments || data.equipment);
        const rawMuscles = this.cleanToArray(data.targetMuscles);
        const rawSteps = this.cleanToArray(data.instructions);

        this.workout = {
          id: data.id,
          title: data.name,
          type: rawMuscles.join(', ').toLowerCase().includes('cardio') ? 'Cardio Fitness' : 'Muscular Strength',
          duration: '15 - 20 minutes',
          calories: '150 Kcal',
          description: `This exercise focuses on your ${rawMuscles.join(', ')}.`,
          image: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${data.id}.gif`,

          // Mapping Instruksi
          steps: rawSteps.map((step, index) => ({
            number: index + 1,
            text: step
          })),

          // Mapping Equipment (Agar icon & nama muncul)
          equipments: rawEquips.map(eq => ({
            name: eq,
            icon: `/assets/workout-detail/${eq.toLowerCase().replace(/\s+/g, '-')}.svg`
          })),
          
          otherTutorials: []
        };

        this.loadOtherTutorials();
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading detail", err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Mengambil tutorial lain dari cache agar ringan
   */
  loadOtherTutorials() {
    const cached = localStorage.getItem('workout_master_cache');
    if (cached) {
      this.processOtherTutorials(JSON.parse(cached));
    } else {
      this.exerciseService.getAllExercises().subscribe(allData => {
        this.processOtherTutorials(allData);
      });
    }
  }

  private processOtherTutorials(data: any[]) {
    this.workout.otherTutorials = data
      .filter(ex => ex.id !== this.workoutId)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(ex => ({
        id: ex.id,
        title: ex.title || ex.name,
        type: ex.type || (this.cleanToArray(ex.targetMuscles).join('').toLowerCase().includes('cardio') ? 'Cardio' : 'Muscular'),
        duration: ex.duration || '15 Min',
        image: ex.image || `https://res.cloudinary.com/dmhzqtzrr/image/upload/${ex.id}.gif`
      }));
  }

  goBack(): void {
    this.location.back();
  }

  onSearch() {
    if (this.searchText.trim().length > 0) {
      this.router.navigate(['/dashboard/workout-lists'], { 
        queryParams: { q: this.searchText } 
      });
    }
  }
}