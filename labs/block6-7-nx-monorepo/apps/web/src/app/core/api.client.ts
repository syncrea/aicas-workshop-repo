import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CurrentUserStore } from './current-user.store';
import { environment } from '../../environments/environment';

/**
 * Thin wrapper around `HttpClient` that prefixes every URL with the API
 * base and attaches the `X-User-Id` header from the {@link CurrentUserStore}.
 * Components and services should use this instead of `HttpClient` directly,
 * so adding cross-cutting headers stays a one-place change.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly currentUser = inject(CurrentUserStore);

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path), { headers: this.headers() });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body, { headers: this.headers() });
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(this.url(path), body, { headers: this.headers() });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path), { headers: this.headers() });
  }

  private url(path: string): string {
    const trimmed = path.startsWith('/') ? path : `/${path}`;
    return `${environment.apiBaseUrl}${trimmed}`;
  }

  private headers(): HttpHeaders {
    const userId = this.currentUser.currentUserId();
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (userId !== null) {
      headers = headers.set('X-User-Id', userId);
    }
    return headers;
  }
}
