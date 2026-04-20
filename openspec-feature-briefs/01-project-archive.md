# Brief 1 — Project Archive Workflow

## What we want

Add a **"project archive"** workflow to the Nx monorepo. Users should be able to archive a project (a soft-delete: the data isn't lost, but the project is hidden from the default project list) and later restore it. Archived projects shouldn't clutter the main list view, but they shouldn't be permanently gone either — there's a separate "Archive" view where you can see archived projects and restore them.

This is a small, common feature in any project-management tool. The shape is familiar (Trello boards, Linear projects, GitHub repos all do something similar), which means the agent will reach for a *generic* version of it. Your spec should pin down the *specific* version that fits this codebase's conventions.

## What we deliberately haven't decided

- **Schema strategy:** boolean flag (`is_archived`) on the existing `projects` table? `archived_at` timestamp (nullable, present = archived)? Separate `project_status` enum? Separate `archived_projects` table?
- **Cascade behavior:** what happens to a project's tasks / comments / members / invites when you archive it? They stay attached and become inaccessible? Stay accessible but read-only? Cascade-archive too? Block the archive operation if there are unresolved sub-items?
- **Authorization:** who can archive? Project owner only? Any project admin? Workspace admin? Same rules as delete?
- **API surface:** `POST /projects/:id/archive` + `POST /projects/:id/restore`? `PATCH /projects/:id` with a status field? `DELETE /projects/:id` with a `?soft=true` query? The existing API has a pattern — find it and follow it.
- **Default list filter:** `GET /projects` excludes archived by default; how do you opt in? `?status=archived`, `?include_archived=true`, separate `GET /projects/archived` endpoint?
- **UI surface:** archive button location (project detail header? row context menu?), where to find the archive view (sidebar item? "Settings → Archive" sub-page?), restore confirmation flow.
- **Audit:** do we need to record who archived and when? If yes, where (a column on `projects`, an `audit_log` table, an event)?

These should all surface in the proposal/specs/design phase. Push back on any plausible-but-arbitrary choice the agent makes — the right answer is usually *"match what the codebase already does for similar concerns."*
