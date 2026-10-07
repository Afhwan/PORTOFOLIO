import type { Metadata } from "next";
import { getPortfolioData } from "@/lib/portfolio-data";
import { Portfolio } from "@/components/portfolio";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const profile = data.profile;
  const title = profile ? `${profile.name_id} — ${profile.title_id}` : "Cybersecurity Portfolio";
  const description = profile?.bio_id || "Portofolio profesional cybersecurity engineer.";
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function HomePage() {
  const data = await getPortfolioData();
  return <Portfolio data={data} />;
}
