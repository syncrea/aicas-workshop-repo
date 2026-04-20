# Brief 2 — Project Comments with @Mentions

## What we want

Add a **comments** feature to projects. A logged-in user can leave a comment on a project, see other people's comments in chronological order, and `@mention` other users in the comment body. Mentioned users get notified (in-app at minimum; whether email is in scope is one of the things you'll decide). Comments belong to the project — when you open a project you see its comment thread.

The frontend should render the comment list, an input box at the bottom, and `@mention` autocomplete as you type. The backend needs a `comments` resource, a way to resolve `@username` references to user IDs, and (probably) some kind of notification record so mentioned users see they were tagged.

## What we deliberately haven't decided

- **Comment shape:** plain text? Markdown? A subset of markdown? Rich text? If markdown, which parser, and is rendering server-side or client-side?
- **`@mention` storage:** store as raw text (`Hello @alice, can you look at this?`) and re-parse on render every time? Or persist resolved mentions as a structured JSON sidecar (`{ "userIds": ["abc"], "ranges": [{ "start": 6, "end": 12, "userId": "abc" }] }`)? The latter is more work upfront but vastly faster to render and bulletproof against a username change.
- **Authorization:** who can comment? Any workspace member? Only project members? Only people invited to the project? Who can delete? Comment author only? Project owner? Workspace admin?
- **Edit / delete:** allowed at all? Time-bounded ("edit within 5 minutes")? Audit-logged? Soft-delete ("[deleted]" placeholder) or hard-delete?
- **Mention resolution scope:** suggest only project members? All workspace members? Anyone in the system? What happens if I mention someone outside the project — do they get added, get an invite, or just get a notification?
- **Notification surface:** in-app inbox? Browser/desktop push? Email digest? All three? Where does notification preference live (per-user setting? per-project setting?).
- **Pagination:** comments can grow unbounded; load all? Paginate by date? Lazy-load older when scrolled to top?
- **Real-time updates:** does another user's new comment appear in my open view automatically (websocket, SSE, polling), or only on refresh?

The plain-text + raw-mention version is shippable in the lab time-box. Anything beyond that is iteration territory — make sure the spec is honest about what's in scope for the *first* slice and what's deferred.
