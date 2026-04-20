# Brief 3 — Project Export to JSON

## What we want

Add a **"export project"** feature. The user clicks an "Export" button on a project, and the system produces a JSON file containing the project itself plus all of its related entities (tasks, comments, members, attachments, etc.) in a single download. The export should be self-contained enough that someone could read it without database access and reconstruct the state of the project at the moment of export.

The endpoint is the meat of the feature; the UI is just a button that triggers it and saves the file. The backend has all the wiring — the question is *how to assemble the export*, not how to add a download button.

## What we deliberately haven't decided

- **Export shape:** single flat JSON? Nested ("project contains tasks contains comments")? Normalised, with a top-level `entities` map keyed by ID? The choice is downstream of "who consumes this?" — backup, migration, analytics, or human-reading?
- **What's included:** the project record + all 1:n children is the minimum. What about: assigned users (whole user record or just `{id, name, email}`?), invites (pending? accepted only?), uploaded files (inline base64? URLs to a CDN? not at all?), audit log entries, archived sub-items, deleted sub-items?
- **PII / privacy:** do you include email addresses, full user names, comments that may contain other people's PII, IP addresses from audit logs? If the export is downloaded by a user with limited permissions, should the contents be filtered to what *that user* can see? Or always include everything because exports are admin-only?
- **Authorization:** who can export? Project owner? Any project member? Workspace admin only? GDPR-style "data subject access" makes any user able to export their own contributions but not the whole project — is that in scope?
- **Generation pattern:** synchronous (request → wait → download)? Async with a job ID and a polling endpoint? Streamed JSON for large projects? The existing API has patterns for long-running operations — match them.
- **Timestamp & version:** does the export include `exportedAt`, the user who exported, and a schema version (so a future re-import knows how to read it)?
- **Re-import:** is re-import in scope? It's a natural complement, but vastly increases the spec surface (ID conflicts, missing related users, schema drift). The lab's first slice is **export only** — but the spec should explicitly state "import is out of scope (see future change `feature-project-import`)" so future-you doesn't have to guess.
- **Format extensibility:** today JSON, tomorrow CSV / NDJSON / a zip with attachments? The endpoint shape might want a `format` parameter from day one even if only `json` is implemented.

Aim for the simplest version that an admin could realistically use as a backup — and be explicit in the spec about what's deferred.
