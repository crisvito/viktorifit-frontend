import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink, ActivatedRoute } from '@angular/router';

interface Workout {
  id: number;
  title: string;
  type: string;
  duration: number;
  image: string;
}

@Component({
  selector: 'app-workout-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  // Pastikan nama file HTML dan CSS sesuai dengan yang ada di folder Anda
  templateUrl: './workout-lists.html', 
  styleUrl: './workout-lists.css', 
})
// Pastikan ada kata kunci 'export' di sini
export class WorkoutLists implements OnInit { 
  
  searchText = '';      
  activeFilter = 'All'; 

  workouts: Workout[] = [
    { id: 1, title: 'Running', type: 'Cardio', duration: 30, image: 'assets/workout-lists/running.jpg' }, // Sesuaikan path image
    { id: 2, title: 'Bench Presses', type: 'Muscular', duration: 20, image: 'assets/workout-lists/bench.jpg' },
    { id: 3, title: 'Overhead Pressed', type: 'Muscular', duration: 30, image: 'assets/workout-lists/overhead.jpg' },
    { id: 4, title: 'Swimming', type: 'Cardio', duration: 30, image: 'assets/workout-lists/swim.jpg' },
    { id: 5, title: 'Dancing', type: 'Cardio', duration: 40, image: 'assets/workout-lists/dance.jpg' },
    { id: 6, title: 'Deadlifts', type: 'Muscular', duration: 20, image: 'assets/workout-lists/deadlift.jpg' },
  ];

  sortValue: 'A - Z' | 'Z - A' = 'A - Z';

  isSortOpen = false;



  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Menangkap data pencarian dari halaman Detail
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchText = query;
      }
    });
  }

  setSort(value: 'A - Z' | 'Z - A') {
    this.sortValue = value;
  }
  
  toggleSort() {
    this.isSortOpen = !this.isSortOpen;
  }

  setFilter(category: string) {
    this.activeFilter = category;
  }

  onSearch() {
    console.log('Searching for:', this.searchText);
  }

  showSuggestions = false;
  filteredSuggestions: string[] = [];
  allKeywords: string[] = [];

  onTyping() {
    if (this.searchText.trim().length > 0) {
      this.filteredSuggestions = this.allKeywords.filter(keyword => 
        keyword.toLowerCase().includes(this.searchText.toLowerCase())
      );
      this.showSuggestions = this.filteredSuggestions.length > 0;
    } else {
      this.showSuggestions = false;
    }
  }

  selectSuggestion(term: string) {
    this.searchText = term;
    this.showSuggestions = false;
    this.onSearch();
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  get filteredWorkouts() {
    let result = this.workouts;

    // Filter berdasarkan Kategori
    if (this.activeFilter !== 'All') {
      result = result.filter(w => w.type === this.activeFilter);
    }

    // Filter berdasarkan Search Text
    if (this.searchText) {
      result = result.filter(w => w.title.toLowerCase().includes(this.searchText.toLowerCase()));
    }

    // Sorting
    return result.sort((a, b) => {
      if (this.sortValue === 'A - Z') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
  }
}