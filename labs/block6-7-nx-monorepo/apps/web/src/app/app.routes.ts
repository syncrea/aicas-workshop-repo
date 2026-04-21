import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'projects',
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./projects/project-list').then((m) => m.ProjectList),
  },
  {
    path: 'projects/new',
    loadComponent: () =>
      import('./projects/project-form').then((m) => m.ProjectForm),
  },
  {
    path: 'projects/:id',
    loadComponent: () =>
      import('./projects/project-detail').then((m) => m.ProjectDetail),
  },
  {
    path: 'projects/:id/edit',
    loadComponent: () =>
      import('./projects/project-form').then((m) => m.ProjectForm),
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
