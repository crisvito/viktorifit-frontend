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
  workout: any = {};

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

  fetchWorkoutDetail(id: string) {
    this.exerciseService.getExerciseById(id).subscribe({
      next: (data) => {
        this.workout = {
          id: data.id,
          title: data.name,
          type: data.targetMuscles.join(', ').toLowerCase().includes('cardio') ? 'Cardio Fitness' : 'Muscular Strength',
          duration: '15 - 20 minutes',
          calories: '150 Kcal',
          description: `This exercise focuses on your ${data.targetMuscles.join(', ')}.`,
          image: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${data.id}.gif`,

          steps: data.instructions.map((step: string, index: number) => {
            const cleanedText = step.replace(/^['\[]+|['\]]+$/g, '').trim();
            return {
              number: index + 1,
              text: cleanedText
            };
          }),

          equipments: data.equipments.map((eq: string) => ({
            name: eq,
            icon: `/assets/workout-detail/${eq.toLowerCase().replace(/\s+/g, '-')}.svg`
          })),
          
          otherTutorials: []
        };

        this.loadOtherTutorials();
      }
    });
  }

  loadOtherTutorials() {
    this.exerciseService.getAllExercises().subscribe(allData => {
      this.workout.otherTutorials = allData
        .filter(ex => ex.exerciseId !== this.workoutId)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(ex => ({
          id: ex.id,
          title: ex.name,
          type: ex.targetMuscles.join(', ').toLowerCase().includes('cardio') ? 'Cardio' : 'Muscular',
          duration: '15 Min',
          image: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${ex.id}.gif`
        }));
    });
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