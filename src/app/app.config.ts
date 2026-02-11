import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 1. IMPORT INI
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // 2. TAMBAHKAN INI DI DALAM PROVIDERS
    provideCharts(withDefaultRegisterables()) 
  ]
};