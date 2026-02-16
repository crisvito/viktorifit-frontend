import { Routes } from '@angular/router';
import { MainLayout, BlankLayout, DashboardLayout, ProfileLayout, AdminLayout } from './layouts';
import { HomePage, LoginPage, MainDashboardPage, MyAccount, PersonalData, RegisterPage, Schedule, Settings, SupportPage, WorkoutDetail, WorkoutLists, History, StatisticPage, RecommendationPage, SuggestionIntroPage, SuggestionResultPage, ChangePassword } from './pages';
import { OnboardingPage } from './pages/onboarding/onboarding';
import { FaqPage, FeedbackPage } from './pages/admin';
import { AuthGuard, GuestGuard, AdminGuard, NotAdminGuard, ProfileGuard} from './core/guards';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomePage, pathMatch: 'full' },
      { path: 'support', component: SupportPage, canActivate: [NotAdminGuard]},
      { path: 'suggestion-intro', component: SuggestionIntroPage },
      { path: 'recommendation/onboarding', component: OnboardingPage },
      { path: 'suggestion-result', component: SuggestionResultPage },
    ]
  },
  {
    path: '',
    component: BlankLayout,
    children: [
      { path: 'login', component: LoginPage, canActivate: [GuestGuard]},
      { path: 'register', component: RegisterPage,canActivate: [GuestGuard] },
      { path: 'onboarding', component: OnboardingPage},
    ]
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard, ProfileGuard],
    canActivateChild: [AuthGuard, ProfileGuard],
    children: [
      { path: '', component: MainDashboardPage,data: { title: 'Dashboard' }},
      { path: 'workout-lists', component: WorkoutLists, data: { title: 'Workout Lists' } },
      { path: 'workout-detail/:id', component: WorkoutDetail,data: { title: 'Workout Detail' }},
      { path: 'statistics', component: StatisticPage,data: { title: 'Statistics' }},
      { path: 'schedule', component: Schedule, data: { title: 'Schedule' }},
      { path: 'history', component: History, data: { title: 'Schedule' }},
      { path: 'recommendation', component: RecommendationPage, data: {title : 'Recommendation'}}
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
      { path: 'change-password', component: ChangePassword, data: {title: 'Change Password'}}
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
    ]
  }
];
