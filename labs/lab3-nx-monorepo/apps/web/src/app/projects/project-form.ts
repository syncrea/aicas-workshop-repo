import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import type { CreateProjectRequest, UpdateProjectRequest } from '@aicas/shared-types';

import { asApiError, describeApiError } from '../core/api-error';
import { ProjectsStore } from './projects.store';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-2xl space-y-6">
      <h1 class="text-xl font-semibold tracking-tight text-slate-900">
        {{ isEdit() ? 'Edit project' : 'New project' }}
      </h1>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700">Name</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="e.g. Q3 marketing site"
          />
          @if (showError('name'); as error) {
            <p class="mt-1 text-xs text-red-600">{{ error }}</p>
          }
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            class="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="What is this project for?"
          ></textarea>
        </div>

        <div>
          <label for="color" class="block text-sm font-medium text-slate-700">Color (hex)</label>
          <div class="mt-1 flex items-center gap-3">
            <input
              id="color"
              type="text"
              formControlName="color"
              class="block w-32 rounded-md border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              placeholder="#64748b"
            />
            <span class="inline-block h-6 w-6 rounded border border-slate-300" [style.background-color]="form.controls.color.value"></span>
          </div>
          @if (showError('color'); as error) {
            <p class="mt-1 text-xs text-red-600">{{ error }}</p>
          }
        </div>

        @if (serverError(); as message) {
          <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {{ message }}
          </div>
        }

        <div class="flex items-center gap-3">
          <button
            type="submit"
            class="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            [disabled]="form.invalid || submitting()"
          >
            {{ submitting() ? 'Saving…' : isEdit() ? 'Save changes' : 'Create project' }}
          </button>
          <button
            type="button"
            class="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            (click)="onCancel()"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProjectForm implements OnInit {
  private readonly store = inject(ProjectsStore);
  private readonly router = inject(Router);

  readonly id = input<string | undefined>();

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    color: new FormControl('#64748b', {
      nonNullable: true,
      validators: [Validators.pattern(HEX_COLOR)],
    }),
  });

  protected readonly submitting = signal(false);
  protected readonly serverError = signal<string | null>(null);
  protected readonly isEdit = computed(() => this.id() !== undefined);

  async ngOnInit(): Promise<void> {
    const id = this.id();
    if (id === undefined) {
      return;
    }
    let project = this.store.byId(id);
    if (project === null) {
      project = await this.store.loadOne(id);
    }
    this.form.patchValue({
      name: project.name,
      description: project.description ?? '',
      color: project.color,
    });
  }

  protected showError(field: 'name' | 'color'): string | null {
    const control = this.form.controls[field];
    if (!control.touched || control.valid) {
      return null;
    }
    if (control.errors?.['required']) {
      return 'Required';
    }
    if (control.errors?.['maxlength']) {
      return 'Too long';
    }
    if (control.errors?.['pattern']) {
      return 'Must be a 6-digit hex color, e.g. #64748b';
    }
    return 'Invalid value';
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.serverError.set(null);
    const value = this.form.getRawValue();
    const id = this.id();

    try {
      if (id === undefined) {
        const body: CreateProjectRequest = {
          name: value.name,
          description: value.description === '' ? null : value.description,
          color: value.color,
        };
        const created = await this.store.create(body);
        await this.router.navigate(['/projects', created.id]);
      } else {
        const body: UpdateProjectRequest = {
          name: value.name,
          description: value.description === '' ? null : value.description,
          color: value.color,
        };
        const updated = await this.store.update(id, body);
        await this.router.navigate(['/projects', updated.id]);
      }
    } catch (error: unknown) {
      this.serverError.set(describeApiError(asApiError(error)));
    } finally {
      this.submitting.set(false);
    }
  }

  protected async onCancel(): Promise<void> {
    const id = this.id();
    await this.router.navigate(id === undefined ? ['/projects'] : ['/projects', id]);
  }
}
