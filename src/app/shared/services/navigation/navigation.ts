import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class Navigation {
  
  private lastNonProfileUrl: string = '/dashboard'; 

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      
      const currentUrl = event.urlAfterRedirects;
      if (!currentUrl.includes('/profile')) {
        this.lastNonProfileUrl = currentUrl;
      }
      
    });
  }

  getBackTarget(): string {
    return this.lastNonProfileUrl;
  }
}