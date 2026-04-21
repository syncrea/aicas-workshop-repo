# TypeScript Conventions

> **Audience:** any code in `apps/api`, `apps/web`, or `libs/shared-types`. Framework-specific conventions live in [`ANGULAR.md`](./ANGULAR.md) and [`NESTJS.md`](./NESTJS.md) — this file covers the language layer common to all three projects.

---

## Strictness

`tsconfig.base.json` enables the strict family. Don't loosen it locally:

- `strict: true`
- `noImplicitOverride: true`
- `noFallthroughCasesInSwitch: true`
- `noPropertyAccessFromIndexSignature: true`

If a strict-mode error blocks you, fix the type — don't `// @ts-ignore` it. The only acceptable escape hatch is a single-line `// eslint-disable-next-line` with a comment explaining *why*, and only when the alternative is genuinely worse.

---

## Functional first, classes when the framework asks

Stateless logic is a **pure function**, not a class. Validation rules, formatting helpers, mappers, error translators — they live as exported functions in a `*.utils.ts` file (or in `apps/web/src/app/shared/utils/`, or `apps/api/src/common/`). The mappers in `apps/api/src/common/mappers.ts` and the formatters in `apps/web/src/app/shared/utils/date.ts` are the canonical examples.

Reach for a `class` when:

- The framework wants one: Nest providers (`@Injectable()`), Angular components, DTOs that need class-validator metadata.
- You actually own state across calls (a `*Store` service in `apps/web`).
- DI is the only clean way to swap an implementation.

A class with one method, no constructor parameters, and no state should be a function. Don't wrap a `static` method in a class to "namespace" it — the file is already the namespace.

---

## `any` is banned, `unknown` is fine

- Prefer narrowing from `unknown` over silently accepting `any`.
- HTTP response bodies are typed by the caller (`api.get<Project[]>(...)`), not by guessing.
- Test mocks may use `as unknown as <Type>` casts when the structural type is too painful to construct.

---

## `interface` vs `type`

- **`interface`** for object shapes that describe a thing — entities, DTOs, props, configs.
- **`type`** for unions, intersections, mapped types, derived types from `as const` literals.

```ts
// Good
export interface Project {
  readonly id: string;
  readonly name: string;
}

export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];
```

`readonly` on every field of a wire-format DTO. Mutate by spreading, never in place.

---

## String enums vs string unions

The whole codebase uses **`as const` arrays + derived unions**, never TypeScript `enum`. Reasons: enums emit runtime code, don't survive `JSON.stringify` cleanly, and are awkward to share across the wire.

```ts
// Yes
export const MEMBER_ROLES = ['owner', 'admin', 'member'] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

// No
export enum MemberRole { Owner = 'owner', Admin = 'admin', Member = 'member' }
```

If you add a new union, mirror it in `libs/shared-types/src/lib/<entity>.ts` *and* in the Prisma schema's column. The `unions.spec.ts` test will fail loudly if the constant array changes — that's the reminder to update the schema.

---

## Discriminated unions and type guards

When a value can be one of several distinct shapes, model it as a **discriminated union** with a literal `type` (or `kind`) field, and write an `is*` predicate that narrows it. The canonical example is `ApiError` in `libs/shared-types/src/lib/api-error.ts`.

```ts
interface OkResult<T> {
  readonly status: 'ok';
  readonly value: T;
}
interface ErrResult {
  readonly status: 'error';
  readonly error: ApiError;
}
export type Result<T> = OkResult<T> | ErrResult;

export function isOk<T>(r: Result<T>): r is OkResult<T> {
  return r.status === 'ok';
}
```

The predicate lives next to the type it narrows, named once. Don't open-code `r.status === 'ok'` checks across the codebase — they break the moment you rename the discriminator.

---

## Imports

- Use the path alias `@aicas/shared-types` for the shared library — never deep imports.
- Type-only imports use `import type` so the bundler can drop them:

  ```ts
  import type { Project, CreateProjectRequest } from '@aicas/shared-types';
  ```

- Within an app, import from the closest barrel that makes sense. Cross-feature imports inside an app are fine (e.g. `users.store.ts` from `header.ts`); cross-app imports are not.
- No circular imports. ESLint will flag them, but if you find yourself wanting one, the boundary is wrong — split a third file out.

---

## Naming

| Thing | Convention |
| --- | --- |
| Files | `kebab-case.ts` (`project-detail.ts`, `current-user.middleware.ts`) |
| Types & interfaces | `PascalCase` (`Project`, `CreateProjectRequest`) |
| Variables, functions | `camelCase` (`currentUserId`, `formatRelativeDate`) |
| Booleans | `is*` / `has*` / `should*` / `can*` (`isLoading`, `hasMembers`, `shouldRetry`, `canEdit`) |
| Constants | `UPPER_SNAKE_CASE` only when truly constant *and* exported as a value (`TASK_STATUSES`) |
| Angular components | `PascalCase` class, `app-` selector prefix (`<app-project-list>`) |
| Nest providers | `PascalCase` ending in their role (`ProjectsService`, `ApiExceptionFilter`) |
| DTOs over the wire | **camelCase fields, always.** `createdAt` not `created_at`, `assigneeId` not `assignee_id`. Prisma columns happen to also be camelCase here, but the wire format is the contract — keep it consistent even if you change the schema. |

---

## Errors

- **Backend:** throw the appropriate Nest exception (`NotFoundException`, `ForbiddenException`, `BadRequestException`, etc.). The global `ApiExceptionFilter` translates them into the canonical `ApiError` JSON. Don't return error objects from services — throw.
- **Frontend:** `firstValueFrom(api.get(...))` will reject with an `HttpErrorResponse`. Wrap it through `asApiError()` from `core/api-error.ts` to get a typed `ApiError`, then call `describeApiError(err)` for a human-readable message.
- **Never swallow errors silently.** If you `try { ... } catch {}`, you'd better have a comment explaining what's intentionally being ignored.

---

## Async / promises

- Prefer `async` / `await` over `.then()` chains, both in services and in stores.
- On the frontend, `firstValueFrom(observable)` is the bridge from `HttpClient`'s observables into the async/await world. Use it consistently in the `*Store` methods so all data access has the same shape.
- Don't fire-and-forget. If a function is async and you don't `await` it, ESLint's `no-floating-promises` rule will fail the build.

---

## Style

The defaults the codebase relies on — call them out so reviewers don't have to.

- **Default parameters** instead of `value = value ?? fallback` inside the body.
- **Optional chaining (`?.`)** and **nullish coalescing (`??`)** over manual `!= null` ladders. `user()?.profile?.bio ?? 'No bio'`, not three nested `if`s.
- **Destructuring** in function parameters and assignments when it shortens the call site. Don't destructure six fields you only use once each.
- **Template literals** for any string with interpolation. No `'User ' + id + ' did X'`.
- **Spread, don't mutate.** `{ ...obj, x: 1 }` and `[...arr, item]` everywhere — including inside `*Store` updaters and inside Nest service mappers. The only place mutation is acceptable is a local accumulator inside a loop where allocation cost would actually matter.

---

## Comments

- Write comments that explain *why*, not *what*. The code shows what.
- TSDoc on exported types and functions when the name isn't self-explanatory. JSDoc tags like `@param` and `@returns` are noise unless they add information beyond what the signature already says.
- No commented-out code. `git log` is your history.

---

## Things this file deliberately does not cover

- **Linting rules** — the ESLint config (`eslint.config.mjs` and per-project overrides) is the source of truth. If a lint rule conflicts with a guideline here, fix the guideline.
- **Test layout** — see the framework-specific guidelines.
- **Module resolution / build output** — controlled by `tsconfig.base.json` and each project's `tsconfig.app.json` / `tsconfig.spec.json`. Don't fight Nx on this.
