export type Locale = "id" | "en";

export interface Profile {
  id: string;
  name_id: string;
  name_en: string;
  title_id: string;
  title_en: string;
  bio_id: string;
  bio_en: string;
  photo_url: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  cv_url: string | null;
  is_published: boolean;
  updated_at: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_url: string | null;
  image_url: string | null;
  document_url: string | null;
  media_urls: string[];
  category: string;
  is_featured: boolean;
  is_published: boolean;
}

export interface Competition {
  id: string;
  name: string;
  organizer: string;
  date: string | null;
  achievement: string;
  ctf_writeup_url: string | null;
  description_id: string;
  description_en: string;
  media_urls: string[];
  is_featured: boolean;
  is_published: boolean;
}

export interface Project {
  id: string;
  title_id: string;
  title_en: string;
  slug: string;
  description_id: string;
  description_en: string;
  tech_stack: string[];
  repo_url: string | null;
  demo_url: string | null;
  image_url: string | null;
  category: "website" | "game" | "security" | "research" | "other" | "appsec" | "blue";
  media_urls: string[];
  is_featured: boolean;
  is_published: boolean;
}

export interface Experience {
  id: string;
  role_id: string;
  role_en: string;
  company: string;
  experience_type: "work" | "education" | "seminar" | "conference" | "workshop" | "volunteering" | "other";
  start_date: string | null;
  end_date: string | null;
  description_id: string;
  description_en: string;
  media_urls: string[];
  is_published: boolean;
}

export interface Article {
  id: string;
  title_id: string;
  title_en: string;
  slug: string;
  excerpt_id: string;
  excerpt_en: string;
  body_markdown: string;
  media_urls: string[];
  tags: string[];
  published_at: string | null;
  is_published: boolean;
}

export interface PortfolioData {
  profile: Profile | null;
  certificates: Certificate[];
  competitions: Competition[];
  projects: Project[];
  experiences: Experience[];
  articles: Article[];
  isDemo: boolean;
}

export type ManagedTable =
  | "profiles"
  | "certificates"
  | "competitions"
  | "projects"
  | "experiences"
  | "articles";
