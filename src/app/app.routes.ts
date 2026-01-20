import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage, RegisterPage } from './pages';
import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { OnboardingPage } from './pages/onboarding/onboarding';
import { SchedulePage } from './pages/schedule/schedule';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      // { path: 'login', component: LoginPage },
    ]
      
  },
  {
    path: '',
    component: BlankLayout,
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      // { path: 'profile', component: ProfileComponent }
      { path: 'onboarding', component: OnboardingPage },
      { path: 'schedule', component: SchedulePage}
    ]
  }
];
