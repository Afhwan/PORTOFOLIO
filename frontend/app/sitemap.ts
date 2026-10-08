import type { MetadataRoute } from "next";
import { getPortfolioData } from "@/lib/portfolio/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (!baseUrl) return [];
  const origin = new URL(baseUrl);
  const data = await getPortfolioData();
  return [
    { url: new URL("/", origin).toString(), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...data.articles.map((article) => ({
      url: new URL(`/writeups/${article.slug}`, origin).toString(),
      lastModified: article.published_at ? new Date(article.published_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
