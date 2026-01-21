import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage, RegisterPage } from './pages';
import { BlankLayout } from './layouts/blank-layout/blank-layout';
import { SupportComponent } from './pages/support/support';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      {path: 'support', component: SupportComponent}
    ]
  },
  {
    path: '',
    component: BlankLayout,
    children: [
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage }
    ]
  }
];
