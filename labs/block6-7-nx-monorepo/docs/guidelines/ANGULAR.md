# Angular Conventions (`apps/web`)

> **Audience:** anyone touching `apps/web/src/`. The TypeScript-level conventions in [`TYPESCRIPT.md`](./TYPESCRIPT.md) apply on top of these — when there's tension, the framework-level rule below wins.

The frontend is **Angular 21, zoneless, signal-first, standalone-only, inline templates**. Read a couple of existing components before writing new ones — the patterns are short and repeat.

---

## Components

- **Always standalone.** No `NgModule`. No `standalone: false`.
- **Inline templates and inline styles.** Don't extract `.html` / `.scss` files. Tailwind utility classes do most of the styling work; component styles only when a Tailwind class would have to repeat 5+ times in the same template.
- **Selector prefix is `app-`** (`<app-project-list>`, `<app-task-board>`).
- One component per file, file name matches the component (`project-list.ts` exports `ProjectList`).
- `changeDetection: ChangeDetectionStrategy.OnPush` is implied by zoneless + signals — you don't need to set it explicitly, but if you do, set `OnPush`.

```ts
@Component({
  selector: 'app-project-card',
  imports: [RouterLink, Avatar],
  template: `
    <a [routerLink]="['/projects', project().id]" class="block rounded-xl ...">
      ...
    </a>
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
```

## Control flow

- **`@if` / `@else` / `@for` / `@switch`** — never the structural-directive forms (`*ngIf`, `*ngFor`, `*ngSwitch`).
- `@for` requires `track`. Use the entity id whenever possible; fall back to `$index` only for genuinely positional lists.
- Don't reach for `*` syntax even in tests or quick prototypes — *the codebase has zero of them and we'd like to keep it that way.*

## State and signals

The default for any new piece of state is **a signal**. The decision tree:

| Need | Reach for |
| --- | --- |
| A piece of mutable state owned by a component | `signal<T>(initial)` |
| Derived value (no own state) | `computed(() => ...)` |
| React to a signal change with a side effect | `effect(() => ...)` |
| Cross-component data (loaded list of projects, current user, ...) | A `*Store` service in `core/` or the feature folder |
| HTTP request that returns once | `firstValueFrom(api.get(...))` inside a store method |
| Genuine streams (websockets, route param streams over time) | RxJS `Observable` — but justify it; the codebase has almost none |

`*Store` services follow a consistent shape — see `apps/web/src/app/projects/projects.store.ts` for the canonical example. New stores should mirror it (private `signal` for the raw data, public `computed` for read-only access, async methods for mutations that update the signal optimistically or after the server response).

## Forms

- **Reactive forms only**, via `NonNullableFormBuilder`. No template-driven (`ngModel`) forms.
- Form values are typed end-to-end. Don't `as any` the form value.
- Validation messages live in the template right next to the field they're about — don't centralise them.

```ts
private readonly fb = inject(NonNullableFormBuilder);
readonly form = this.fb.group({
  name: this.fb.control('', { validators: [Validators.required, Validators.maxLength(80)] }),
  description: this.fb.control(''),
});
```

## Routing

- All feature routes are **lazy-loaded** via `loadComponent: () => import('./...').then(m => m.X)`.
- `withComponentInputBinding()` is enabled (`apps/web/src/app/app.config.ts`). Route params arrive as **signal inputs**, not via `ActivatedRoute`:

  ```ts
  // route: 'projects/:id'
  readonly id = input.required<string>('id');   // ← Angular wires the route param into this signal
  ```

  Don't use `ActivatedRoute.snapshot.paramMap` or `paramMap.subscribe(...)`. Use `input()`.

## HTTP

- **Never inject `HttpClient` directly.** Inject `ApiClient` from `core/api.client.ts` — it prefixes `/api` and attaches the `X-User-Id` header automatically.
- Stores are the only layer that talks to `ApiClient`. Components never make HTTP calls themselves.

```ts
@Injectable({ providedIn: 'root' })
export class ProjectsStore {
  private readonly api = inject(ApiClient);

  async loadAll(): Promise<void> {
    const list = await firstValueFrom(this.api.get<Project[]>('/projects'));
    // ...
  }
}
```

## Errors

- Catch errors at the call site (typically a component's event handler), pass through `asApiError(err)` from `core/api-error.ts`, then `describeApiError(err)` to get a string for the UI.
- Don't surface raw `HttpErrorResponse` to the template.
- Show errors inline — the codebase doesn't have a global toast/snackbar layer yet.

## Shared UI

- Reusable visual primitives live in `apps/web/src/app/shared/components/` — `Avatar`, `RoleBadge`, `TaskStatusPill`. Read them before building a one-off equivalent.
- Reusable formatting / pure helpers live in `apps/web/src/app/shared/utils/` — `formatRelativeDate`, `initialsOf`. Same rule: import the existing helper, don't inline a `new Date(...)` calculation in the template.
- A new shared component or util should only land in `shared/` if **two or more features already need it**. Premature sharing is worse than late sharing.

## Tailwind

- Tailwind 4, configured CSS-first (`apps/web/src/styles.css` imports `tailwindcss`).
- Stick to utility classes. If a utility chain repeats verbatim 3+ times, extract a small component, not a CSS class.
- Spacing scale, color palette, font sizes — all the defaults from Tailwind 4 are fine; we're not customising the design system in this baseline.

## Tests

- **Vitest** via the `@angular/build:unit-test` builder. `npx nx test web` runs the suite.
- Co-locate `*.spec.ts` next to the file under test.
- Prefer testing public behaviour (rendered output, store invariants) over implementation details. The current shipped tests are sparse — that's fine for the workshop, but new substantial logic should ship with at least one spec.

## What to do when this file doesn't cover your case

1. Check what an existing feature does — `projects` is the most complete example end-to-end.
2. If two features do it differently, the older one is probably accidentally older, not intentionally different. Pick the cleaner pattern and propose aligning.
3. Ask before introducing a new dependency (`@ngrx/*`, NgRx Component Store, signal-store, RxJS plugins, etc.). The current architecture is deliberately small; new dependencies need a real reason.
