import type { ManagedTable } from "@/lib/types";

export type AdminRow = Record<string, unknown> & { id?: string };

export const managedTables: ManagedTable[] = [
  "profiles",
  "certificates",
  "competitions",
  "projects",
  "experiences",
  "articles",
];

const editableColumns: Record<ManagedTable, ReadonlySet<string>> = {
  profiles: new Set([
    "name_id", "name_en", "title_id", "title_en", "bio_id", "bio_en",
    "photo_url", "email", "linkedin", "github", "cv_url", "is_published",
  ]),
  certificates: new Set([
    "title", "issuer", "issue_date", "expiry_date", "credential_url",
    "image_url", "category", "is_featured", "is_published",
  ]),
  competitions: new Set([
    "name", "organizer", "date", "achievement", "ctf_writeup_url",
    "description_id", "description_en", "is_featured", "is_published",
  ]),
  projects: new Set([
    "title_id", "title_en", "slug", "description_id", "description_en",
    "tech_stack", "repo_url", "demo_url", "image_url", "category",
    "is_featured", "is_published",
  ]),
  experiences: new Set([
    "role_id", "role_en", "company", "start_date", "end_date",
    "description_id", "description_en", "is_published",
  ]),
  articles: new Set([
    "title_id", "title_en", "slug", "excerpt_id", "excerpt_en",
    "body_markdown", "tags", "published_at", "is_published",
  ]),
};

export function isManagedTable(value: string): value is ManagedTable {
  return managedTables.includes(value as ManagedTable);
}

export function getEditableEntries(table: ManagedTable, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Request body must be a JSON object.");
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) throw new Error("At least one editable field is required.");
  if (entries.some(([key]) => !editableColumns[table].has(key))) {
    throw new Error("Request contains an unsupported field.");
  }
  for (const [key, fieldValue] of entries) {
    if (["is_published", "is_featured"].includes(key)) {
      if (typeof fieldValue !== "boolean") throw new Error(`Invalid field value: ${key}.`);
    } else if (["tech_stack", "tags"].includes(key)) {
      if (!Array.isArray(fieldValue) || fieldValue.length > 100 ||
        fieldValue.some((tag) => typeof tag !== "string" || tag.length > 200)) {
        throw new Error(`Invalid field value: ${key}.`);
      }
    } else if (fieldValue !== null && (
      typeof fieldValue !== "string" ||
      fieldValue.length > (key === "body_markdown" ? 200_000 : 10_000)
    )) {
      throw new Error(`Invalid field value: ${key}.`);
    }
  }
  return entries;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    throw new Error("Request origin is not allowed.");
  }
}
