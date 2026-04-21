import { Component, computed, input } from '@angular/core';

import { initialsOf } from '../utils/date';

@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="inline-flex items-center justify-center rounded-full font-medium tracking-tight text-white"
      [class.h-6]="size() === 'sm'"
      [class.w-6]="size() === 'sm'"
      [class.text-xs]="size() === 'sm'"
      [class.h-9]="size() === 'md'"
      [class.w-9]="size() === 'md'"
      [class.text-sm]="size() === 'md'"
      [class.h-12]="size() === 'lg'"
      [class.w-12]="size() === 'lg'"
      [class.text-base]="size() === 'lg'"
      [style.background-color]="color()"
    >
      {{ initials() }}
    </span>
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly initials = computed(() => initialsOf(this.name()));

  protected readonly color = computed(() => colorForName(this.name()));
}

const PALETTE = [
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#14b8a6', // teal
  '#ef4444', // red
  '#6366f1', // indigo
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
