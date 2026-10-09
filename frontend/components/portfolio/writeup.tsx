"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { MediaGallery } from "./media-gallery";

export function Writeup({ article }: { article: Article }) {
  const [english, setEnglish] = useState(false);
  const galleryImages = (article.media_urls ?? []).filter((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  });
  return (
    <main className="shell writeup-page">
      <nav className="nav writeup-nav">
        <Link className="brand" href="/">← Portfolio</Link>
        <button className="tool-button" type="button" onClick={() => setEnglish(!english)}>{english ? "ID" : "EN"}</button>
      </nav>
      <article>
        <p className="eyebrow">{article.tags.join(" / ") || "WRITE-UP"}</p>
        <h1>{english ? article.title_en : article.title_id}</h1>
        <p className="writeup-lead">{english ? article.excerpt_en : article.excerpt_id}</p>
        {galleryImages.length > 0 && (
          <MediaGallery
            images={galleryImages}
            alt={english ? article.title_en : article.title_id}
            labels={{
              previous: english ? "Previous image" : "Foto sebelumnya",
              next: english ? "Next image" : "Foto berikutnya",
              image: english ? "Image" : "Foto",
            }}
          />
        )}
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body_markdown}</ReactMarkdown>
        </div>
      </article>
      <Link className="button button-quiet" href="/">← Back to portfolio</Link>
    </main>
  );
}
