"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
  direction?: "top" | "bottom";
}

export function BlurText({
  text,
  className = "",
  delay = 55,
  direction = "bottom",
}: BlurTextProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = elementRef.current;
    if (!element || !("IntersectionObserver" in window)) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setRevealed(true);
      observer.unobserve(entry.target);
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span
        ref={elementRef}
        aria-hidden="true"
        className={`blur-text${revealed ? " is-revealed" : ""}${className ? ` ${className}` : ""}`}
        style={{ "--blur-text-offset": direction === "top" ? "-.28em" : ".28em" } as CSSProperties}
      >
        {words.map((word, index) => (
          <span className="blur-text-word" key={`${word}-${index}`} style={{ animationDelay: `${index * delay}ms` }}>
            {word}{index < words.length - 1 ? "\u00a0" : ""}
          </span>
        ))}
      </span>
    </>
  );
}
