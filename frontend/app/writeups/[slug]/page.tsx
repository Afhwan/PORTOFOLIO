import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortfolioData } from "@/lib/portfolio-data";
import { Writeup } from "@/components/writeup";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPortfolioData();
  const article = data.articles.find((item) => item.slug === slug);
  if (!article) return { title: "Write-up tidak ditemukan" };
  return {
    title: article.title_id,
    description: article.excerpt_id,
    openGraph: { title: article.title_id, description: article.excerpt_id, type: "article" },
  };
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPortfolioData();
  const article = data.articles.find((item) => item.slug === slug);
  if (!article) notFound();
  return <Writeup article={article} />;
}
