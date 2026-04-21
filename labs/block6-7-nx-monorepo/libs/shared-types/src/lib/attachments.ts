import type { UserSummary } from './users';

/**
 * File metadata. The current backend stores no actual file bytes — the
 * `storageKey` is a notional pointer (e.g. `s3://bucket/path`). Anything
 * that needs the real binary is out of scope for the workshop baseline.
 */
export interface Attachment {
  readonly id: string;
  readonly projectId: string;
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly uploadedBy: UserSummary;
  readonly createdAt: string;
}

/** Body accepted by `POST /api/projects/:projectId/attachments`. */
export interface CreateAttachmentRequest {
  readonly fileName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
}
