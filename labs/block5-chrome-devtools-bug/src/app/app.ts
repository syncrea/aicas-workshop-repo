import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

interface FeedbackFormControls {
  name: FormControl<string>;
  message: FormControl<string>;
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-full bg-slate-50 py-12">
      <div class="mx-auto max-w-xl px-6">
        <header class="mb-8">
          <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
            Send us feedback
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            Help us make the workshop better. We read every message.
          </p>
        </header>

        <form
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
          class="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          novalidate
        >
          <label class="block text-sm">
            <span class="font-medium text-slate-700">Your name</span>
            <input
              type="text"
              formControlName="name"
              class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </label>

          <label class="block text-sm">
            <span class="font-medium text-slate-700">Message</span>
            <textarea
              rows="4"
              formControlName="message"
              class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            ></textarea>
          </label>

          <div class="flex items-center justify-end">
            <button
              type="submit"
              class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              [disabled]="form.invalid"
            >
              Send feedback
            </button>
          </div>
        </form>

        @if (submitted()) {
          <div
            class="feedback-success mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
            role="status"
          >
            <p class="font-medium">
              ✅ Thanks {{ submittedName() }}, we received your feedback.
            </p>
            <p class="mt-1 text-sm text-emerald-800">
              We'll get back to you within two business days.
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class App {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form: FormGroup<FeedbackFormControls> = this.fb.group({
    name: this.fb.control('', Validators.required),
    message: this.fb.control('', [Validators.required, Validators.minLength(5)]),
  });

  protected readonly submitted = signal(false);
  protected readonly submittedName = signal('');

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name } = this.form.getRawValue();
    this.submittedName.set(name);
    this.submitted.set(true);
    this.form.reset();
  }
}
