import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError, ApiErrorCode } from '@aicas/shared-types';

/**
 * Coerce anything thrown by `HttpClient` into the canonical {@link ApiError}
 * envelope. Network failures (no server, CORS, etc.) map to a synthetic
 * `internal_error` envelope so callers always have one shape to handle.
 */
export function asApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return {
        statusCode: 0,
        message: 'Network error: could not reach the API',
        code: 'internal_error',
        details: null,
      };
    }
    if (isApiError(error.error)) {
      return error.error;
    }
    return {
      statusCode: error.status,
      message: error.message,
      code: 'internal_error',
      details: null,
    };
  }
  return {
    statusCode: 0,
    message: error instanceof Error ? error.message : 'Unknown error',
    code: 'internal_error',
    details: null,
  };
}

const VALID_CODES: readonly ApiErrorCode[] = [
  'unauthorized',
  'forbidden',
  'not_found',
  'validation_failed',
  'conflict',
  'internal_error',
];

function isApiError(value: unknown): value is ApiError {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Partial<ApiError>;
  return (
    typeof candidate.statusCode === 'number' &&
    typeof candidate.message === 'string' &&
    typeof candidate.code === 'string' &&
    VALID_CODES.includes(candidate.code as ApiErrorCode)
  );
}

/**
 * Best-effort human label for an {@link ApiError}. Surfaces validation
 * field errors when present, falls back to the message otherwise.
 */
export function describeApiError(error: ApiError): string {
  if (error.code === 'validation_failed' && error.details && Array.isArray(error.details['fields'])) {
    return (error.details['fields'] as string[]).join('; ');
  }
  return error.message;
}
