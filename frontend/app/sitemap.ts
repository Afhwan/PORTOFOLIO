import type { MetadataRoute } from "next";
import { getPortfolioData } from "@/lib/portfolio-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_SITE_URL is not configured; sitemap will use an example host.");
  }
  const origin = baseUrl ? new URL(baseUrl) : new URL("https://example.invalid");
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
