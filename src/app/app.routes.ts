import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage } from './pages';
import { BlankLayout } from './layouts/blank-layout/blank-layout';
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
      { path: 'login', component: LoginPage }
      // { path: '', component: DashboardHomeComponent },
      // { path: 'profile', component: ProfileComponent }
    ]
  }
];
