"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

type MediaGalleryProps = {
  images: string[];
  alt: string;
  labels: { previous: string; next: string; image: string };
};

export function MediaGallery({ images, alt, labels }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const direction = useRef(1);
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const activeImage = images[activeIndex];

  useGSAP(() => {
    const image = imageRef.current;
    if (!image) return;
    let isActive = true;
    let revertAnimation: (() => void) | undefined;
    void import("gsap").then(({ gsap }) => {
      if (!isActive) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const context = gsap.context(() => {
        gsap.fromTo(image,
          { autoAlpha: 0, x: reducedMotion ? 0 : direction.current * 14 },
          { autoAlpha: 1, x: 0, duration: reducedMotion ? 0 : 0.28, ease: "power2.out" },
        );
      }, frameRef);
      revertAnimation = () => context.revert();
    });
    return () => {
      isActive = false;
      revertAnimation?.();
    };
  }, { dependencies: [activeIndex], scope: frameRef, revertOnUpdate: true });

  if (!activeImage) return null;

  function showImage(nextIndex: number) {
    direction.current = nextIndex > activeIndex ? 1 : -1;
    setActiveIndex((nextIndex + images.length) % images.length);
  }

  return (
    <div className="media-gallery" ref={frameRef} aria-label={alt}>
      <div className="media-gallery-frame">
        <Image
          ref={imageRef}
          src={activeImage}
          alt={`${alt} — ${labels.image} ${activeIndex + 1}`}
          fill
          sizes="(max-width: 760px) 90vw, (max-width: 1100px) 42vw, 30vw"
          unoptimized
        />
      </div>
      {images.length > 1 && (
        <div className="media-gallery-controls" aria-label={`${alt}: ${activeIndex + 1}/${images.length}`}>
          <button type="button" onClick={() => showImage(activeIndex - 1)} aria-label={labels.previous}>←</button>
          <div className="media-gallery-dots" role="group" aria-label={alt}>
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                aria-label={`${labels.image} ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => showImage(index)}
              />
            ))}
          </div>
          <span className="media-gallery-count">{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => showImage(activeIndex + 1)} aria-label={labels.next}>→</button>
        </div>
      )}
    </div>
  );
}
