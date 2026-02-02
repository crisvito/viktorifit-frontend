import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { HomePage, LoginPage, RegisterPage, SuggestionPage } from './pages';
import { BlankLayout } from './layouts/blank-layout/blank-layout';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'suggestion', component: SuggestionPage },
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
    ]
  }
];
