/**
 * Discriminated-union result type for operations that can fail.
 *
 * Using `Result` instead of throwing keeps service call sites explicit:
 * the caller has to handle both branches, and TypeScript narrows
 * `result.value` / `result.error` based on the `ok` discriminator.
 *
 * Throw only for truly unexpected programmer errors; use `Result` for
 * any failure the caller should reasonably handle (validation,
 * not-found, conflict, persistence failures, etc.).
 */
export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
