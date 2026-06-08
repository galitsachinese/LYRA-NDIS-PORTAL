import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

// --- Layouts ---
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './core/layouts/public-layout/public-layout.component';

// --- Auth Features ---
import { MyLoginComponent } from './features/auth/login/my-login.component';
import { MySignupComponent } from './features/auth/signup/my-signup.component';

// --- Service Features (Used in both Public and Protected branches) ---
import { ServicesListComponent } from './features/services/services-list/services-list.page';
import { ServiceDetailComponent } from './features/services/service-detail/service-detail.page';

// --- Booking & Participant Features ---
import { MyBookingsComponent } from './features/bookings/my-bookings/my-bookings.page';
import { BookServiceComponent } from './features/bookings/book-service/book-service.page';
import { ParticipantBookServiceComponent } from './features/participant/book-service/participant-book-service.page';

// --- Coordinator Features ---
import { DashboardComponent } from './features/coordinator/dashboard/dashboard.page';
import { ManageServicesComponent } from './features/coordinator/manage-services/manage-services.page';
import { AllBookingsComponent } from './features/coordinator/all-bookings/all-bookings.page';
import { SupportWorkersComponent } from './features/coordinator/support-workers/support-workers.page';

// --- Shared/Errors ---
import { ForbiddenComponent } from '../shared/components/error/forbidden/forbidden.component';

export const routes: Routes = [
  // =========================================================================
  // 1. PUBLIC BRANCH: Open to all visitors (No Auth Required)
  // =========================================================================
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public-website/home/home.page').then(
            (m) => m.HomePageComponent,
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/public-website/about/about.page').then(
            (m) => m.AboutPageComponent,
          ),
      },
      {
        path: 'admission',
        loadComponent: () =>
          import('./features/public-website/admission/admission.page').then(
            (m) => m.AdmissionPageComponent,
          ),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('../shared/components/contact-section/contact-section.component').then(
            (m) => m.ContactSectionComponent,
          ),
      },
      // PUBLIC SERVICE LISTING: Browsable by everyone
      { path: 'explore/services', component: ServicesListComponent },
      { path: 'explore/services/:id', component: ServiceDetailComponent },
    ],
  },

  // =========================================================================
  // 2. AUTH BRANCH: Login and Signup entry points
  // =========================================================================
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'signup', component: MySignupComponent },
      { path: 'login', component: MyLoginComponent },
      { path: '', redirectTo: '/login', pathMatch: 'full' },
    ],
  },

  // =========================================================================
  // 3. PROTECTED BRANCH: Requires AuthGuard for dashboards and booking flow
  // =========================================================================
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [AuthGuard],
    children: [
      // Coordinator Routes
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

      // Authenticated Booking Flow (Participant access only)
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

  // =========================================================================
  // 4. FALLBACK: Error handling
  // =========================================================================
  { path: 'forbidden', component: ForbiddenComponent },
  { path: '**', redirectTo: 'forbidden' },
];
