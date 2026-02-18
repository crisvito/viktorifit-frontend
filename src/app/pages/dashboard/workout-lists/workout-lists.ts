import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ExerciseService } from '../../../core'; 

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
  workouts: any[] = []; 
  allKeywords: string[] = []; 
  sortValue: 'A - Z' | 'Z - A' = 'A - Z';
  isSortOpen = false;
  showSuggestions = false;
  filteredSuggestions: string[] = [];
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private exerciseService: ExerciseService
  ) {}

  ngOnInit() {
    this.initWorkoutData();

    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) { 
        this.searchText = query; 
        this.onTyping();
      }
    });
  }

  // --- CACHING LOGIC ---
  initWorkoutData() {
    const cachedData = localStorage.getItem('workout_master_cache');
    if (cachedData) {
      this.workouts = JSON.parse(cachedData);
      this.allKeywords = this.workouts.map(w => w.title);
    } else {
      this.loadExercisesFromAPI();
    }
  }

  loadExercisesFromAPI() {
    this.isLoading = true;
    this.exerciseService.getAllExercises().subscribe({
      next: (data) => {
        const mappedData = data.map(ex => {
          const cleanMuscles = this.cleanFormat(ex.targetMuscles).toLowerCase();
          const cleanEquip = this.cleanFormat(ex.equipment);

          const isCardioType = cleanMuscles.includes('cardio') || cleanMuscles.includes('body weight');

          return {
            id: ex.id,
            title: ex.name,
            type: isCardioType ? 'Cardio' : 'Muscular',
            equipment: cleanEquip,
            duration: 15, 
            image: `https://res.cloudinary.com/dmhzqtzrr/image/upload/${ex.id}.gif`
          };
        });

        this.workouts = mappedData;
        this.allKeywords = this.workouts.map(w => w.title);
        localStorage.setItem('workout_master_cache', JSON.stringify(mappedData));
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Gagal load API", err);
        this.isLoading = false;
      }
    });
  }

  // --- FIXED CLEANER: MENGHAPUS [' '], NEWLINES, DAN BULLETS ---
  private cleanFormat(val: any): string {
    if (!val) return 'No Equipment';
    
    let str = '';
    if (Array.isArray(val)) {
      str = val.join(', ');
    } else {
      str = String(val);
    }

    return str
      .replace(/[\[\]']/g, '')         // Hapus [ ] dan '
      .replace(/[•\-\*]/g, '')         // Hapus bullet points atau dash jika ada dalam string
      .replace(/[\r\n]+/g, ', ')       // Ganti Newline (pindah baris) dengan koma
      .split(',')                      // Pecah berdasarkan koma
      .map(item => item.trim())        // Bersihkan spasi di tiap item
      .filter(item => item.length > 0) // Buang item kosong
      .join(', ');                     // Gabungkan kembali dengan rapi
  }

  // --- LOGIKA FILTER & SORT ---
  get filteredWorkouts() {
    let result = [...this.workouts];

    if (this.activeFilter !== 'All') {
      result = result.filter(w => w.type === this.activeFilter);
    }

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      result = result.filter(w => w.title.toLowerCase().includes(searchLower));
    }

    return result.sort((a, b) => {
      return this.sortValue === 'A - Z' 
        ? a.title.localeCompare(b.title) 
        : b.title.localeCompare(a.title);
    });
  }

  // --- UI INTERACTION ---
  setSort(value: 'A - Z' | 'Z - A') { 
    this.sortValue = value; 
    this.isSortOpen = false; 
  }

  toggleSort() { 
    this.isSortOpen = !this.isSortOpen; 
  }

  setFilter(category: string) { 
    this.activeFilter = category; 
  }

  onSearch() { 
    this.showSuggestions = false; 
  }

  onTyping() {
    if (this.searchText.trim().length > 0) {
      this.filteredSuggestions = this.allKeywords
        .filter(keyword => keyword.toLowerCase().includes(this.searchText.toLowerCase()))
        .slice(0, 5); 
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