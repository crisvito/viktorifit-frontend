import { Routes } from '@angular/router';
<<<<<<< HEAD
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage, RegisterPage } from './pages';
import { SuggestionResult } from './pages/suggestion-result/suggestion-result';
import { SuggestionIntro } from './pages/suggestion-intro/suggestion-intro';
import { RecommendationComponent } from './pages/recommendation/recommendation';
import { User } from './pages/user/user';
import { DashboardPage } from './pages/dashboard/dashboard';


import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { OnboardingPage } from './pages/onboarding/onboarding';
=======
import { MainLayout, BlankLayout, DashboardLayout, ProfileLayout, AdminLayout } from './layouts';
import { HomePage, LoginPage, MainDashboardPage, MyAccount, PersonalData, RegisterPage, Schedule, Settings, SupportPage, WorkoutDetail, WorkoutLists, History, StatisticPage, RecommendationPage, SuggestionIntroPage, SuggestionResultPage } from './pages';
import { OnboardingPage } from './pages/onboarding/onboarding';
import { FaqPage, FeedbackPage } from './pages/admin';
import { AuthGuard, GuestGuard, AdminGuard, NotAdminGuard } from './core/guards';
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
<<<<<<< HEAD
      { path: '', component: HomePage },
      { path: 'suggestion-intro', component: SuggestionIntro },
      { path: 'recommendation/onboarding', component: OnboardingPage },
      { path: 'suggestion-result', component: SuggestionResult },
      // { path: 'support', component: SupportPage },
      // { path: 'login', component: LoginPage },
=======
      { path: '', component: HomePage, pathMatch: 'full' },
      { path: 'support', component: SupportPage, canActivate: [NotAdminGuard]},
      { path: 'suggestion-intro', component: SuggestionIntroPage },
      { path: 'recommendation/onboarding', component: OnboardingPage },
      { path: 'suggestion-result', component: SuggestionResultPage },
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
    ]
  },

  {
    path: '',
    component: BlankLayout,
    children: [
<<<<<<< HEAD
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
      { path: 'onboarding', component: OnboardingPage },
      // { path: 'profile', component: ProfileComponent }
=======
      { path: 'login', component: LoginPage, canActivate: [GuestGuard]},
      { path: 'register', component: RegisterPage,canActivate: [GuestGuard] },
      { path: 'onboarding', component: OnboardingPage},
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', component: MainDashboardPage,data: { title: 'Dashboard' }},
      { path: 'workout-lists', component: WorkoutLists, data: { title: 'Workout Lists' } },
      { path: 'workout-detail/:id', component: WorkoutDetail,data: { title: 'Workout Detail' }},
      { path: 'statistics', component: StatisticPage,data: { title: 'Statistics' }},
      { path: 'schedule', component: Schedule, data: { title: 'Schedule' }},
      { path: 'history', component: History, data: { title: 'Schedule' }},
      { path: 'recommendation', component: RecommendationPage, data: {title : 'Recommendation'}},
    ]
  },
  {
    path: 'profile',
    component: ProfileLayout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: 'my-account', component: MyAccount },
      { path: 'personal-data', component: PersonalData },
      { path: 'settings', component: Settings },
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
    { path: '', redirectTo: 'faq', pathMatch: 'full'},
      { path: 'faq', component: FaqPage },
      { path: 'feedback', component: FeedbackPage }
>>>>>>> 9741e081527942c2b2a3db9cb1f62a8dcbb761b7
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
