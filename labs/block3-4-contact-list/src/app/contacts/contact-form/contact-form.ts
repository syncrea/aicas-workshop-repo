import { Component, computed, effect, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ContactDraft, ContactError } from '../contact.model';
import { ContactService } from '../contact.service';

interface ContactFormControls {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  company: FormControl<string>;
  notes: FormControl<string>;
}

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <h2 class="text-2xl font-semibold tracking-tight">
        {{ isEdit() ? 'Edit contact' : 'New contact' }}
      </h2>

      @if (loadError()) {
        <div class="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <p class="font-medium text-amber-900">Contact not found</p>
          <a
            routerLink="/contacts"
            class="mt-2 inline-block text-sm font-medium text-amber-900 underline"
          >
            Back to all contacts
          </a>
        </div>
      } @else {
        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="space-y-5 rounded-lg border border-slate-200 bg-white p-6"
          novalidate
        >
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label class="block text-sm">
              <span class="font-medium text-slate-700">First name</span>
              <input
                type="text"
                formControlName="firstName"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              @if (errorFor('firstName'); as msg) {
                <span class="mt-1 block text-xs text-red-600">{{ msg }}</span>
              }
            </label>

            <label class="block text-sm">
              <span class="font-medium text-slate-700">Last name</span>
              <input
                type="text"
                formControlName="lastName"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              @if (errorFor('lastName'); as msg) {
                <span class="mt-1 block text-xs text-red-600">{{ msg }}</span>
              }
            </label>

            <label class="block text-sm sm:col-span-2">
              <span class="font-medium text-slate-700">Email</span>
              <input
                type="email"
                formControlName="email"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              @if (errorFor('email'); as msg) {
                <span class="mt-1 block text-xs text-red-600">{{ msg }}</span>
              }
            </label>

            <label class="block text-sm">
              <span class="font-medium text-slate-700">Phone</span>
              <input
                type="tel"
                formControlName="phone"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </label>

            <label class="block text-sm">
              <span class="font-medium text-slate-700">Company</span>
              <input
                type="text"
                formControlName="company"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
            </label>

            <label class="block text-sm sm:col-span-2">
              <span class="font-medium text-slate-700">Notes</span>
              <textarea
                rows="3"
                formControlName="notes"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              ></textarea>
            </label>
          </div>

          <div class="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
            <a
              routerLink="/contacts"
              class="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </a>
            <button
              type="submit"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {{ isEdit() ? 'Save changes' : 'Create contact' }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class ContactForm {
  private readonly service = inject(ContactService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly id = input<string | undefined>(undefined);

  protected readonly isEdit = computed(() => this.id() !== undefined);
  protected readonly loadError = computed(() => {
    const id = this.id();
    if (id === undefined) return false;
    return !this.service.getById(id).ok;
  });

  protected readonly form: FormGroup<ContactFormControls> = this.fb.group({
    firstName: this.fb.control('', Validators.required),
    lastName: this.fb.control('', Validators.required),
    email: this.fb.control('', [Validators.required, Validators.email]),
    phone: this.fb.control(''),
    company: this.fb.control(''),
    notes: this.fb.control(''),
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id === undefined) return;
      const result = this.service.getById(id);
      if (!result.ok) return;
      const c = result.value;
      this.form.reset({
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone ?? '',
        company: c.company ?? '',
        notes: c.notes ?? '',
      });
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const draft: ContactDraft = this.form.getRawValue();
    const id = this.id();
    const result = id ? this.service.update(id, draft) : this.service.create(draft);

    if (result.ok) {
      void this.router.navigate(['/contacts', result.value.id]);
      return;
    }

    this.applyServerError(result.error);
  }

  protected errorFor(field: 'firstName' | 'lastName' | 'email'): string | null {
    const control = this.form.controls[field];
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) {
      return `${this.labelFor(field)} is required`;
    }
    if (control.hasError('email')) {
      return 'Email looks invalid';
    }
    if (control.hasError('server')) {
      return control.getError('server') as string;
    }
    return null;
  }

  private labelFor(field: 'firstName' | 'lastName' | 'email'): string {
    return field === 'firstName' ? 'First name' : field === 'lastName' ? 'Last name' : 'Email';
  }

  private applyServerError(error: ContactError): void {
    if (error.kind === 'validation') {
      const control = this.form.controls[error.field];
      control.setErrors({ server: error.message });
      control.markAsTouched();
    }
  }
}
