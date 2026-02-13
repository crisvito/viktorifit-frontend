import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage, RegisterPage } from './pages';
import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { OnboardingPage } from './pages/onboarding/onboarding';
import { User } from './pages/user/user';
import { WorkoutLists } from './pages/workout-lists/workout-lists';
import { WorkoutDetail } from './pages/workout-detail/workout-detail';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfileLayout } from './pages/profile-layout/profile-layout';
import { MyAccount } from './pages/my-account/my-account';
import { PersonalData } from './pages/personal-data/personal-data';
import { Settings } from './pages/settings/settings';
import { Schedule } from './pages/schedule/schedule';
import { History } from './pages/history/history';
import { Statistic } from './pages/statistic/statistic';
import { Faq } from './pages/faq/faq';
import { Feedback } from './pages/feedback/feedback';
import { AdminLayout } from './layouts/admin-layout/admin-layout';


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
      { path: 'onboarding', component: OnboardingPage },
    ]
  },
  {
    path: '',
    component: User,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'workout-lists', component: WorkoutLists },
      { path: 'workout-detail/:id', component: WorkoutDetail },
      { path: 'dashboard', component: Dashboard },
      { path: 'schedule', component: Schedule },
      { path: 'history', component: History },
      { path: 'statistic', component: Statistic }
    ]
  },
  {
    path: 'profile',
    component: ProfileLayout,
    children: [
      { path: '', redirectTo: 'my-account', pathMatch: 'full' },
      { path: 'my-account', component: MyAccount },
      { path: 'personal-data', component: PersonalData },
      { path: 'settings', component: Settings },
    ]
  },
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'faq', pathMatch: 'full' },
      { path: 'faq', component: Faq },
      { path: 'feedback', component: Feedback }

    ]
  }

];
