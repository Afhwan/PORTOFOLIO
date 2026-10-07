import { cache } from "react";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PortfolioData } from "@/lib/types";

export const getPortfolioData = cache(async function getPortfolioData(): Promise<PortfolioData> {
  if (!isSupabaseConfigured()) {
    return {
      profile: null,
      certificates: [],
      competitions: [],
      projects: [],
      experiences: [],
      articles: [],
      isDemo: true,
    };
  }

  const supabase = createServerClient();
  const [profiles, certificates, competitions, projects, experiences, articles] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("is_published", true).limit(1),
      supabase.from("certificates").select("*").eq("is_published", true).order("issue_date", { ascending: false }),
      supabase.from("competitions").select("*").eq("is_published", true).order("date", { ascending: false }),
      supabase.from("projects").select("*").eq("is_published", true).order("is_featured", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("experiences").select("*").eq("is_published", true).order("start_date", { ascending: false }),
      supabase.from("articles").select("*").eq("is_published", true).order("published_at", { ascending: false }),
    ]);

  for (const result of [profiles, certificates, competitions, projects, experiences, articles]) {
    if (result.error) {
      throw new Error(`Could not load portfolio content: ${result.error.message}`);
    }
  }

  return {
    profile: profiles.data[0] ?? null,
    certificates: certificates.data,
    competitions: competitions.data,
    projects: projects.data,
    experiences: experiences.data,
    articles: articles.data,
    isDemo: false,
  };
});
