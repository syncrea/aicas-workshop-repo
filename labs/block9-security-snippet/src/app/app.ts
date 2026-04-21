import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { ProfileFormValue } from './profile.model';
import { ProfileService } from './profile.service';

interface ProfileFormControls {
  displayName: FormControl<string>;
  bio: FormControl<string>;
  avatarUrl: FormControl<string>;
  tagsCsv: FormControl<string>;
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-full bg-slate-50 py-12">
      <div class="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 lg:grid-cols-2">
        <section>
          <header class="mb-6">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900">
              Edit your public profile
            </h1>
            <p class="mt-1 text-sm text-slate-600">
              Updates are visible to anyone who visits your profile page.
            </p>
          </header>

          <form
            [formGroup]="form"
            (ngSubmit)="onSubmit()"
            class="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            novalidate
          >
            <label class="block text-sm">
              <span class="font-medium text-slate-700">Display name</span>
              <input
                type="text"
                formControlName="displayName"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>

            <label class="block text-sm">
              <span class="font-medium text-slate-700">Bio (HTML allowed)</span>
              <textarea
                rows="5"
                formControlName="bio"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs"
              ></textarea>
            </label>

            <label class="block text-sm">
              <span class="font-medium text-slate-700">Avatar URL</span>
              <input
                type="url"
                formControlName="avatarUrl"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              />
              <button
                type="button"
                (click)="loadAvatarPreview()"
                class="mt-2 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Preview
              </button>
            </label>

            <label class="block text-sm">
              <span class="font-medium text-slate-700">Tags (comma-separated)</span>
              <input
                type="text"
                formControlName="tagsCsv"
                class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2"
              />
            </label>

            <div class="flex items-center justify-between border-t border-slate-200 pt-4">
              <button
                type="button"
                (click)="renewSession()"
                class="text-xs text-slate-500 underline"
              >
                Renew session ({{ keepaliveToken() || 'new' }})
              </button>
              <button
                type="submit"
                class="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save profile
              </button>
            </div>

            @if (status(); as msg) {
              <p class="text-xs text-slate-600">{{ msg }}</p>
            }
          </form>
        </section>

        <section>
          <header class="mb-6">
            <h2 class="text-lg font-semibold tracking-tight text-slate-900">
              Live preview
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              This is what your profile page will look like.
            </p>
          </header>

          <article
            class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div class="flex items-center gap-3">
              @if (avatarPreviewUrl(); as src) {
                <img [src]="src" alt="avatar" class="h-12 w-12 rounded-full object-cover" />
              } @else {
                <div class="h-12 w-12 rounded-full bg-slate-200"></div>
              }
              <p class="font-medium text-slate-900">
                {{ displayName() || 'Anonymous' }}
              </p>
            </div>
            <div
              class="prose prose-sm mt-4 text-slate-700"
              [innerHTML]="trustedBio()"
            ></div>
            <ul class="mt-4 flex flex-wrap gap-2">
              @for (tag of tags(); track tag) {
                <li
                  class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {{ tag }}
                </li>
              }
            </ul>
          </article>
        </section>
      </div>
    </div>
  `,
})
export class App {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProfileService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly form: FormGroup<ProfileFormControls> = this.fb.group({
    displayName: this.fb.control(''),
    bio: this.fb.control('Hi! I work on <em>fun things</em>.'),
    avatarUrl: this.fb.control(''),
    tagsCsv: this.fb.control('engineering, music'),
  });

  protected readonly status = signal<string | null>(null);
  protected readonly keepaliveToken = signal<string>('');
  protected readonly avatarPreviewUrl = signal<string | null>(null);

  protected readonly displayName = signal('');
  protected readonly bio = signal('Hi! I work on <em>fun things</em>.');
  protected readonly trustedBio = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.bio()),
  );
  protected readonly tags = computed(() =>
    this.form.controls.tagsCsv.value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0),
  );

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.displayName.set(this.form.controls.displayName.value);
      this.bio.set(this.form.controls.bio.value);
    });
  }

  protected renewSession(): void {
    this.keepaliveToken.set(this.service.generateKeepaliveToken());
  }

  protected async loadAvatarPreview(): Promise<void> {
    const url = this.form.controls.avatarUrl.value;
    if (!url) return;
    try {
      const blob = await this.service.previewAvatar(url);
      this.avatarPreviewUrl.set(URL.createObjectURL(blob));
    } catch (err) {
      this.status.set(`Avatar preview failed: ${(err as Error).message}`);
    }
  }

  protected async onSubmit(): Promise<void> {
    const value: ProfileFormValue = this.form.getRawValue();
    try {
      const moderation = await this.service.checkBio(value.bio);
      if (moderation.flagged) {
        this.status.set('Bio flagged by moderation — please revise.');
        return;
      }
      const saved = await this.service.save(value);
      this.status.set(`Saved at ${saved.savedAt}.`);
    } catch (err) {
      this.status.set(`Save failed: ${(err as Error).message}`);
    }
  }
}
