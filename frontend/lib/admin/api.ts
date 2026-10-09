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
    "image_url", "document_url", "media_urls", "category", "is_featured", "is_published",
  ]),
  competitions: new Set([
    "name", "organizer", "date", "achievement", "ctf_writeup_url",
    "description_id", "description_en", "media_urls", "is_featured", "is_published",
  ]),
  projects: new Set([
    "title_id", "title_en", "slug", "description_id", "description_en",
    "tech_stack", "repo_url", "demo_url", "image_url", "media_urls", "category",
    "is_featured", "is_published",
  ]),
  experiences: new Set([
    "role_id", "role_en", "company", "experience_type", "start_date", "end_date",
    "description_id", "description_en", "media_urls", "is_published",
  ]),
  articles: new Set([
    "title_id", "title_en", "slug", "excerpt_id", "excerpt_en",
    "body_markdown", "media_urls", "tags", "published_at", "is_published",
  ]),
};

const allowedOptions: Partial<Record<ManagedTable, Record<string, readonly string[]>>> = {
  projects: {
    category: ["website", "game", "security", "research", "other"],
  },
  experiences: {
    experience_type: ["work", "education", "seminar", "conference", "workshop", "volunteering", "other"],
  },
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
    } else if (["tech_stack", "tags", "media_urls"].includes(key)) {
      const maxEntryLength = key === "media_urls" ? 2048 : 200;
      if (!Array.isArray(fieldValue) || fieldValue.length > 100 ||
        fieldValue.some((tag) => typeof tag !== "string" || tag.length > maxEntryLength)) {
        throw new Error(`Invalid field value: ${key}.`);
      }
      if (key === "media_urls" && fieldValue.some((url) => {
        try {
          const parsed = new URL(url);
          return !["https:", "http:"].includes(parsed.protocol);
        } catch {
          return true;
        }
      })) {
        throw new Error("Media URLs must use HTTP or HTTPS.");
      }
    } else if (fieldValue !== null && (
      typeof fieldValue !== "string" ||
      fieldValue.length > (key === "body_markdown" ? 200_000 : 10_000)
    )) {
      throw new Error(`Invalid field value: ${key}.`);
    }
    const options = allowedOptions[table]?.[key];
    if (options && typeof fieldValue === "string" && !options.includes(fieldValue)) {
      throw new Error(`Invalid field value: ${key}. Choose one of: ${options.join(", ")}.`);
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
