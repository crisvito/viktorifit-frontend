import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage, RegisterPage } from './pages';
import { SuggestionResult } from './pages/suggestion-result/suggestion-result';
import { SuggestionIntro } from './pages/suggestion-intro/suggestion-intro';
import { RecommendationComponent } from './pages/recommendation/recommendation';
import { User } from './pages/user/user';
import { DashboardPage } from './pages/dashboard/dashboard';


import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { OnboardingPage } from './pages/onboarding/onboarding';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'suggestion-intro', component: SuggestionIntro },
      { path: 'recommendation/onboarding', component: OnboardingPage },
      { path: 'suggestion-result', component: SuggestionResult },
      // { path: 'support', component: SupportPage },
      // { path: 'login', component: LoginPage },
    ]
  },

  {
    path: '',
    component: BlankLayout,
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'onboarding', component: OnboardingPage },
      // { path: 'profile', component: ProfileComponent }
    ]
  },

  {
  path: '',
    component: User,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {path: 'recommendation', component: RecommendationComponent},
      {path: 'dashboard', component: DashboardPage}
    ]
  },
];
