import { Routes } from '@angular/router';
import { ServicesListComponent } from './features/services/services-list.page';
import { MyBookingsComponent } from './features/bookings/my-bookings.page';

export const routes: Routes = [
  {
    path: 'services',
    component: ServicesListComponent
  },
  {
    path: 'bookings',
    component: MyBookingsComponent
  },
  // Redirect empty path to bookings
  {
    path: '',
    redirectTo: 'bookings',
    pathMatch: 'full'
  }
];