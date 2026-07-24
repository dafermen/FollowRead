import type { VersionedResource } from "@followread/shared-types";

export const contentTypes = ["story", "article", "book", "lesson"] as const;

export type ContentType = (typeof contentTypes)[number];

export interface ContentSummary extends VersionedResource {
  readonly type: ContentType;
  readonly title: string;
  readonly language: string;
}
