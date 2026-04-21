/**
 * Canonical shape of every error response returned by the API.
 *
 * The backend's exception filter always produces this shape; the frontend's
 * `ApiClient` always parses it. Anything else is a bug.
 */
export interface ApiError {
  readonly statusCode: number;
  readonly message: string;
  readonly code: ApiErrorCode;
  readonly details?: Record<string, unknown> | null;
}

export const API_ERROR_CODES = [
  'unauthorized',
  'forbidden',
  'not_found',
  'validation_failed',
  'conflict',
  'internal_error',
] as const;
export type ApiErrorCode = (typeof API_ERROR_CODES)[number];
