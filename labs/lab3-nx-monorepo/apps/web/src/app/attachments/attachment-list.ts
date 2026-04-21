import { Component, OnChanges, SimpleChanges, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { asApiError, describeApiError } from '../core/api-error';
import { formatRelativeDate } from '../shared/utils/date';
import { AttachmentsStore } from './attachments.store';

@Component({
  selector: 'app-attachment-list',
  imports: [ReactiveFormsModule],
  template: `
    <section class="space-y-4">
      <ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
        @for (attachment of attachments(); track attachment.id) {
          <li class="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p class="text-sm font-medium text-slate-800">{{ attachment.fileName }}</p>
              <p class="text-xs text-slate-500">
                {{ attachment.contentType }} · {{ formatBytes(attachment.sizeBytes) }} · uploaded
                by {{ attachment.uploadedBy.name }} {{ relative(attachment.createdAt) }}
              </p>
            </div>
            <button
              type="button"
              class="text-xs text-red-600 hover:underline"
              (click)="onRemove(attachment.id)"
            >
              Remove
            </button>
          </li>
        }
        @if (attachments().length === 0) {
          <li class="px-4 py-6 text-center text-xs text-slate-400">No attachments yet.</li>
        }
      </ul>

      <form
        [formGroup]="addForm"
        (ngSubmit)="onAdd()"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h3 class="text-sm font-medium text-slate-700">Register an attachment</h3>
        <p class="mt-1 text-xs text-slate-500">
          The workshop API stores file metadata only — no actual file upload yet.
          The storage key is a notional pointer.
        </p>
        <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
          <input
            type="text"
            formControlName="fileName"
            placeholder="design.pdf"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="text"
            formControlName="contentType"
            placeholder="application/pdf"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <input
            type="number"
            formControlName="sizeBytes"
            placeholder="bytes"
            min="0"
            class="rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            [disabled]="addForm.invalid || submitting()"
            class="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {{ submitting() ? 'Saving…' : 'Add' }}
          </button>
        </div>
        @if (errorMessage(); as message) {
          <p class="mt-2 text-xs text-red-600">{{ message }}</p>
        }
      </form>
    </section>
  `,
})
export class AttachmentList implements OnChanges {
  private readonly store = inject(AttachmentsStore);

  readonly projectId = input.required<string>();

  protected readonly attachments = this.store.attachments;
  protected readonly relative = formatRelativeDate;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly addForm = new FormGroup({
    fileName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contentType: new FormControl('application/octet-stream', { nonNullable: true, validators: [Validators.required] }),
    sizeBytes: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId']) {
      void this.store.loadFor(this.projectId());
    }
  }

  protected formatBytes(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} kB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected async onRemove(attachmentId: string): Promise<void> {
    try {
      await this.store.remove(this.projectId(), attachmentId);
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    }
  }

  protected async onAdd(): Promise<void> {
    if (this.addForm.invalid) {
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const value = this.addForm.getRawValue();
    try {
      await this.store.create(this.projectId(), {
        fileName: value.fileName,
        contentType: value.contentType,
        sizeBytes: value.sizeBytes,
        storageKey: `s3://workshop-fake/${this.projectId()}/${value.fileName}`,
      });
      this.addForm.reset({ fileName: '', contentType: 'application/octet-stream', sizeBytes: 0 });
    } catch (error: unknown) {
      this.errorMessage.set(describeApiError(asApiError(error)));
    } finally {
      this.submitting.set(false);
    }
  }
}
