import { cache } from "react";
import { getPool, isDatabaseConfigured } from "@/lib/database/neon";
import type { PortfolioData } from "@/lib/types";

export const getPortfolioData = cache(async function getPortfolioData(): Promise<PortfolioData> {
  if (!isDatabaseConfigured()) {
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

  const pool = getPool();
  const [profiles, certificates, competitions, projects, experiences, articles] =
    await Promise.all([
      pool.query("select * from public.profiles where is_published order by updated_at desc limit 1"),
      pool.query("select * from public.certificates where is_published order by issue_date desc nulls last"),
      pool.query("select * from public.competitions where is_published order by date desc nulls last"),
      pool.query("select * from public.projects where is_published order by is_featured desc, created_at desc"),
      pool.query("select * from public.experiences where is_published order by start_date desc nulls last"),
      pool.query("select * from public.articles where is_published order by published_at desc nulls last"),
    ]);

  return {
    profile: profiles.rows[0] ?? null,
    certificates: certificates.rows,
    competitions: competitions.rows,
    projects: projects.rows,
    experiences: experiences.rows,
    articles: articles.rows,
    isDemo: false,
  };
});
