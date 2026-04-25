import { Routes } from '@angular/router';
import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';
import { ServicesListComponent } from './features/services/services-list.page';
import { MyBookingsComponent } from './features/bookings/my-bookings.page';

export const routes: Routes = [
  {
    path: 'signup',
    component: MySignupComponent,
  },
  {
    path: 'login',
    component: MyLoginComponent,
  },
  {
    path: '',
    redirectTo: '/signup',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  // Wildcard route for 404
  {
    path: '**',
    redirectTo: '/login',
  },

  {
    path: 'services',
    component: ServicesListComponent,
  },
  {
    path: 'bookings',
    component: MyBookingsComponent,
  },
];
