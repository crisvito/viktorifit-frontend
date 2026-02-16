import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ExerciseService } from '../../../core'; // Sesuaikan path

@Component({
  selector: 'app-workout-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './workout-lists.html', 
  styleUrl: './workout-lists.css', 
})
export class WorkoutLists implements OnInit { 
  
  searchText = '';      
  activeFilter = 'All'; 
  workouts: any[] = []; // Menampung data dari database
  allKeywords: string[] = []; // Untuk sugesti pencarian
  sortValue: 'A - Z' | 'Z - A' = 'A - Z';
  isSortOpen = false;
  showSuggestions = false;
  filteredSuggestions: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit() {
    this.loadExercises();

    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) { this.searchText = query; }
    });
  }

  loadExercises() {
    this.exerciseService.getAllExercises().subscribe({
      next: (data) => {
        this.workouts = data.map(ex => ({
          id: ex.id,
          title: ex.name,
          // Logika sederhana: jika ada kata 'cardio' di targetMuscles, tipenya Cardio
          type: ex.targetMuscles.includes('cardio') ? 'Cardio' : 'Muscular',
          duration: 15, // Default duration karena di DB tidak ada
          image: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${ex.id}.gif`
        }));
        
        // Ambil semua nama untuk bahan sugesti search
        this.allKeywords = this.workouts.map(w => w.title);
      },
      error: (err) => console.error("Gagal load exercises", err)
    });
  }

  // --- LOGIKA FILTER & SORT ---
  get filteredWorkouts() {
    let result = [...this.workouts];

    if (this.activeFilter !== 'All') {
      result = result.filter(w => w.type === this.activeFilter);
    }

    if (this.searchText) {
      result = result.filter(w => w.title.toLowerCase().includes(this.searchText.toLowerCase()));
    }

    return result.sort((a, b) => {
      return this.sortValue === 'A - Z' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    });
  }

  // --- UI LOGIC ---
  setSort(value: 'A - Z' | 'Z - A') { this.sortValue = value; this.isSortOpen = false; }
  toggleSort() { this.isSortOpen = !this.isSortOpen; }
  setFilter(category: string) { this.activeFilter = category; }
  onSearch() { this.showSuggestions = false; }

  onTyping() {
    if (this.searchText.trim().length > 0) {
      this.filteredSuggestions = this.allKeywords.filter(keyword => 
        keyword.toLowerCase().includes(this.searchText.toLowerCase())
      ).slice(0, 5); // Ambil 5 sugesti saja agar tidak kepanjangan
      this.showSuggestions = this.filteredSuggestions.length > 0;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(term: string) {
    this.searchText = term;
    this.showSuggestions = false;
  }

  hideSuggestions() {
    setTimeout(() => { this.showSuggestions = false; }, 200);
  }
}