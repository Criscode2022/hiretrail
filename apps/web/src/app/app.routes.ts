import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'pipeline',
        loadComponent: () =>
          import('./pages/pipeline/pipeline.component').then(
            (m) => m.PipelineComponent,
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./pages/applications/applications.component').then(
            (m) => m.ApplicationsComponent,
          ),
      },
      {
        path: 'applications/new',
        loadComponent: () =>
          import('./pages/applications/application-form.component').then(
            (m) => m.ApplicationFormComponent,
          ),
      },
      {
        path: 'applications/:id',
        loadComponent: () =>
          import('./pages/applications/application-detail.component').then(
            (m) => m.ApplicationDetailComponent,
          ),
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./pages/companies/companies.component').then(
            (m) => m.CompaniesComponent,
          ),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./pages/contacts/contacts.component').then(
            (m) => m.ContactsComponent,
          ),
      },
      {
        path: 'interviews',
        loadComponent: () =>
          import('./pages/interviews/interviews.component').then(
            (m) => m.InterviewsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
