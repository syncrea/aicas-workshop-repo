import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'contacts',
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./contacts/contact-list/contact-list').then((m) => m.ContactList),
  },
  {
    path: 'contacts/new',
    loadComponent: () =>
      import('./contacts/contact-form/contact-form').then((m) => m.ContactForm),
  },
  {
    path: 'contacts/:id',
    loadComponent: () =>
      import('./contacts/contact-detail/contact-detail').then((m) => m.ContactDetail),
  },
  {
    path: 'contacts/:id/edit',
    loadComponent: () =>
      import('./contacts/contact-form/contact-form').then((m) => m.ContactForm),
  },
  {
    path: '**',
    redirectTo: 'contacts',
  },
];
