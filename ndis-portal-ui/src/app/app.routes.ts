import { Routes } from '@angular/router';

import { AuthGuard } from './/core/guards/auth.guard';
import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';
import { ServicesListComponent } from './features/services/services-list/services-list.page';
import { ServiceDetailComponent } from './features/services/service-detail/service-detail.page';
import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';
import { BookServiceComponent } from './features/bookings/book-service/book-service.page';
import { ParticipantBookServiceComponent } from './features/participant/book-service/participant-book-service.page';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/coordinator/dashboard/dashboard.page';
import { ManageServicesComponent } from './features/coordinator/manage-services/manage-services.page';
import { AllBookingsComponent } from './features/coordinator/all-bookings/all-bookings.page';
import { SupportWorkersComponent } from './features/coordinator/support-workers/support-workers.page';
import { ForbiddenComponent } from '../shared/components/error/forbidden/forbidden.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
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
        redirectTo: '/login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { role: 'coordinator' },
      },
      {
        path: 'dashboard/services',
        component: ManageServicesComponent,
        data: { role: 'coordinator' },
      },
      {
        path: 'dashboard/bookings',
        component: AllBookingsComponent,
        data: { role: 'coordinator' },
      },
      {
        path: 'dashboard/support-workers',
        component: SupportWorkersComponent,
        data: { role: 'coordinator' },
      },
      {
        path: 'services',
        component: ServicesListComponent,
        data: { role: 'participant' },
      },
      {
        path: 'services/:id',
        component: ServiceDetailComponent,
        data: { role: 'participant' },
      },
      {
        path: 'bookings',
        component: MyBookingsComponent,
        data: { role: 'participant' },
      },
      {
        path: 'book-new',
        component: BookServiceComponent,
        data: { role: 'participant' },
      },
      {
        path: 'participant/book-service',
        component: ParticipantBookServiceComponent,
        data: { role: 'participant' },
      },
    ],
  },
  {
    path: 'forbidden',
    component: ForbiddenComponent,
  },
  { path: '**', redirectTo: 'forbidden' },
];
