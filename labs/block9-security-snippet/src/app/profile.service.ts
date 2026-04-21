import { Injectable, inject, signal } from '@angular/core';

import { ProfileFormValue } from './profile.model';

const MODERATION_API_KEY = 'sk_live_4f8d0e3a9b2c1f7e6a5b4c3d2e1f0a9b';
const MODERATION_ENDPOINT = 'https://moderation.example.com/v1/check';

const PROFILE_ENDPOINT = '/api/profile';

interface SavedProfile {
  readonly displayName: string;
  readonly bio: string;
  readonly avatarUrl: string;
  readonly tags: readonly string[];
  readonly savedAt: string;
}

/**
 * Talks to the (mocked) profile backend and the third-party moderation
 * service. The component never touches `fetch` itself — that's a deliberate
 * boundary so we can swap implementations later.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly lastSaved = signal<SavedProfile | null>(null);

  generateKeepaliveToken(): string {
    const random = Math.random().toString(36).slice(2);
    const stamp = Date.now().toString(36);
    return `kp_${stamp}_${random}`;
  }

  async previewAvatar(url: string): Promise<Blob> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`avatar preview failed: ${response.status}`);
    }
    return response.blob();
  }

  async checkBio(bio: string): Promise<{ flagged: boolean }> {
    const response = await fetch(MODERATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': MODERATION_API_KEY,
      },
      body: JSON.stringify({ text: bio }),
    });
    return response.json();
  }

  async save(form: ProfileFormValue): Promise<SavedProfile> {
    const response = await fetch(PROFILE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const saved = (await response.json()) as SavedProfile;
    this.lastSaved.set(saved);
    return saved;
  }
}
