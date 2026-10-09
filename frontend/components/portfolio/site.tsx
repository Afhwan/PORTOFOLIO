"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import type { Locale, PortfolioData } from "@/lib/types";
import { NextjsLogoDark } from "@/components/ui/svgs/nextjsLogoDark";
import { NextjsLogoLight } from "@/components/ui/svgs/nextjsLogoLight";
import { ReactDark } from "@/components/ui/svgs/reactDark";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { Unity } from "@/components/ui/svgs/unity";
import { UnityDark } from "@/components/ui/svgs/unityDark";
import { BlurText } from "@/components/ui/blur-text";
import { MediaGallery } from "./media-gallery";

const text = {
  id: {
    skip: "Lewati ke konten", navAbout: "Tentang", navProjects: "Proyek",
    navProof: "Kredensial", navExperience: "Pengalaman", navWriting: "Write-up",
    navContact: "Kontak", profileDetails: "PROFIL / 01",
    projectCount: "PROYEK", proofCount: "KREDENSIAL", writingCount: "WRITE-UP",
    observe: "AMATI", analyze: "ANALISIS", improve: "TINGKATKAN",
    heroTitle: "Membangun pertahanan.", heroAccent: "Memahami ancaman.",
    heroLead: "Keamanan praktis, pembelajaran berkelanjutan, dan sistem yang lebih tangguh.",
    viewWork: "Jelajahi karya", contactCta: "Hubungi saya", profileCard: "Ringkasan profil",
    aboutTitle: "Keamanan dimulai dari rasa ingin tahu.",
    aboutIntro: "Kemampuan teknis, cara berpikir, dan pengalaman yang bisa diverifikasi.",
    projectsTitle: "Belajar dengan membangun.",
    projectsIntro: "Eksperimen, produk, dan karya teknis dari berbagai bidang.",
    all: "Semua", searchProjects: "Cari proyek atau teknologi...",
    searchCertificates: "Cari sertifikat...", searchCompetitions: "Cari kompetisi...",
    noMatches: "Tidak ada hasil yang cocok dengan filter.",
    noProjects: "Belum ada proyek terpublikasi.",
    proofTitle: "Kredibilitas, bukan klaim.", certs: "Sertifikat", competitions: "Kompetisi & CTF",
    noCertificates: "Belum ada sertifikat terpublikasi.", noCompetitions: "Belum ada kompetisi terpublikasi.",
    verify: "VERIFIKASI ↗", readWriteup: "BACA WRITE-UP ↗",
    experienceTitle: "Pengalaman & pendidikan.",
    noExperience: "Pengalaman dan pendidikan akan ditampilkan di sini.",
    writingTitle: "Write-up & catatan.",
    writingIntro: "Catatan teknis dan write-up CTF yang dapat dibagikan secara bertanggung jawab.",
    readMore: "Baca write-up →", noArticles: "Belum ada write-up terpublikasi.",
    contactTitle: "Mari bicara soal keamanan.",
    contactText: "Terbuka untuk percakapan seputar cybersecurity, kolaborasi, dan peluang profesional.",
    email: "Email", linkedin: "LinkedIn", github: "GitHub", downloadCv: "Unduh CV ↗",
    admin: "Admin", footer: "Dibuat dengan rasa ingin tahu & niat baik.",
    demoBanner: "Mode pratinjau: hubungkan database Neon untuk mengelola dan menampilkan profil Anda.",
    featured: "UNGGULAN", openRepo: "REPOSITORY ↗", liveDemo: "DEMO ↗",
    noProfile: "Lengkapi profil Anda melalui panel admin.",
    contactSetup: "Tambahkan tautan kontak melalui panel admin.",
    projectWebsite: "Website", projectGame: "Game", projectSecurity: "Keamanan", projectResearch: "Riset", projectOther: "Lainnya",
    experienceWork: "Pekerjaan", experienceEducation: "Pendidikan", experienceSeminar: "Seminar", experienceConference: "Konferensi",
    experienceWorkshop: "Workshop", experienceVolunteering: "Relawan", experienceOther: "Lainnya",
    previousImage: "Foto sebelumnya", nextImage: "Foto berikutnya", image: "Foto",
    certificateDocument: "Lihat dokumen sertifikat ↗",
  },
  en: {
    skip: "Skip to content", navAbout: "About", navProjects: "Projects",
    navProof: "Credentials", navExperience: "Experience", navWriting: "Write-ups",
    navContact: "Contact", profileDetails: "PROFILE / 01",
    projectCount: "PROJECTS", proofCount: "CREDENTIALS", writingCount: "WRITE-UPS",
    observe: "OBSERVE", analyze: "ANALYZE", improve: "IMPROVE",
    heroTitle: "Building defenses.", heroAccent: "Understanding threats.",
    heroLead: "Practical security, continuous learning, and building more resilient systems.",
    viewWork: "Explore my work", contactCta: "Get in touch", profileCard: "Profile summary",
    aboutTitle: "Security starts with curiosity.",
    aboutIntro: "Technical ability, thoughtful problem-solving, and verifiable experience.",
    projectsTitle: "Learning by building.",
    projectsIntro: "Experiments, products, and technical work across different disciplines.",
    all: "All", searchProjects: "Search projects or technology...",
    searchCertificates: "Search certifications...", searchCompetitions: "Search competitions...",
    noMatches: "No results match these filters.",
    noProjects: "No published projects yet.",
    proofTitle: "Credibility, not claims.", certs: "Certifications", competitions: "Competitions & CTFs",
    noCertificates: "No published certifications yet.", noCompetitions: "No published competitions yet.",
    verify: "VERIFY ↗", readWriteup: "READ WRITE-UP ↗",
    experienceTitle: "Experience & education.",
    noExperience: "Experience and education will appear here.",
    writingTitle: "Write-ups & notes.",
    writingIntro: "Technical notes and CTF write-ups shared responsibly.",
    readMore: "Read write-up →", noArticles: "No published write-ups yet.",
    contactTitle: "Let’s talk security.",
    contactText: "Open to conversations about cybersecurity, collaboration, and professional opportunities.",
    email: "Email", linkedin: "LinkedIn", github: "GitHub", downloadCv: "Download CV ↗",
    admin: "Admin", footer: "Built with curiosity & good intent.",
    demoBanner: "Preview mode: connect a Neon database to manage and publish your profile.",
    featured: "FEATURED", openRepo: "REPOSITORY ↗", liveDemo: "LIVE DEMO ↗",
    noProfile: "Complete your profile in the admin panel.",
    contactSetup: "Add contact links in the admin panel.",
    projectWebsite: "Website", projectGame: "Game", projectSecurity: "Security", projectResearch: "Research", projectOther: "Other",
    experienceWork: "Work", experienceEducation: "Education", experienceSeminar: "Seminar", experienceConference: "Conference",
    experienceWorkshop: "Workshop", experienceVolunteering: "Volunteering", experienceOther: "Other",
    previousImage: "Previous image", nextImage: "Next image", image: "Image",
    certificateDocument: "View certificate document ↗",
  },
} as const;

const skillNotes = {
  id: [
    "Meninjau kode, memetakan ancaman, dan menguji keamanan aplikasi.",
    "Memahami segmentasi, monitoring, dan penguatan jaringan.",
    "Melatih pola pikir analitis lewat CTF dan lab keamanan.",
    "Mengenali sinyal, melakukan triase, dan merespons insiden.",
  ],
  en: [
    "Reviewing code, mapping threats, and testing application security.",
    "Understanding network segmentation, monitoring, and hardening.",
    "Sharpening analytical thinking through CTFs and security labs.",
    "Recognizing signals, triaging alerts, and responding to incidents.",
  ],
} as const;

const projectCategoryKeys = ["all", "website", "game", "security", "research", "other"] as const;
const experienceTypeLabels = {
  work: "experienceWork",
  education: "experienceEducation",
  seminar: "experienceSeminar",
  conference: "experienceConference",
  workshop: "experienceWorkshop",
  volunteering: "experienceVolunteering",
  other: "experienceOther",
} as const;

const technologyLogos: Record<string, { dark: typeof NextjsLogoDark; light: typeof NextjsLogoLight }> = {
  "next.js": { dark: NextjsLogoDark, light: NextjsLogoLight },
  nextjs: { dark: NextjsLogoDark, light: NextjsLogoLight },
  react: { dark: ReactDark, light: ReactLight },
  unity: { dark: UnityDark, light: Unity },
} as const;

function setPointerSpotlight(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
  event.currentTarget.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--card-tilt-x", `${-y * 2}deg`);
    event.currentTarget.style.setProperty("--card-tilt-y", `${x * 2}deg`);
  }
}

function resetPointerSpotlight(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--card-tilt-x", "0deg");
  event.currentTarget.style.setProperty("--card-tilt-y", "0deg");
}

function setProfileTilt(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  event.currentTarget.style.setProperty("--tilt-x", `${-y * 4}deg`);
  event.currentTarget.style.setProperty("--tilt-y", `${x * 5}deg`);
}

function resetProfileTilt(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
}

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeMediaUrls(values: Array<string | null | undefined>) {
  return values.map((value) => value ? safeExternalUrl(value) : null).filter((url): url is string => Boolean(url));
}

function formatDate(value: string | Date | null, locale: Locale) {
  if (!value) return "";
  const date = value instanceof Date
    ? value
    : new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function Portfolio({ data }: { data: PortfolioData }) {
  const [locale, setLocale] = useState<Locale>("id");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [certificateQuery, setCertificateQuery] = useState("");
  const [competitionQuery, setCompetitionQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [activeSkill, setActiveSkill] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const languageTimerRef = useRef<number | null>(null);
  const themeTimerRef = useRef<number | null>(null);
  const labels = text[locale];
  const profile = data.profile;

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("portfolio-theme");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    } catch (error) {
      console.warn("Theme preference could not be loaded.", error);
    }
  }, []);

  useEffect(() => () => {
    if (languageTimerRef.current !== null) window.clearTimeout(languageTimerRef.current);
    if (themeTimerRef.current !== null) window.clearTimeout(themeTimerRef.current);
    delete document.documentElement.dataset.languageMotion;
    delete document.documentElement.dataset.themeMotion;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
    document.title = `${profile ? (locale === "id" ? profile.name_id : profile.name_en) : "Cybersecurity Engineer"} — Portfolio`;
  }, [locale, profile, theme]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const sections = document.querySelectorAll("main section[id]");
    let observer: IntersectionObserver | undefined;
    const observeSections = () => {
      observer?.disconnect();
      const viewportHeight = window.innerHeight;
      const nextObserver = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveSection(visible[0].target.id);
      }, {
        rootMargin: `-${Math.round(viewportHeight * 0.22)}px 0px -${Math.round(viewportHeight * 0.68)}px 0px`,
        threshold: 0,
      });
      observer = nextObserver;
      sections.forEach((element) => nextObserver.observe(element));
    };

    observeSections();
    window.addEventListener("resize", observeSections);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeSections);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        document.documentElement.style.setProperty("--scroll-progress", String(progress));
        const shouldShowBackToTop = window.scrollY > 520;
        setShowBackToTop((current) => current === shouldShowBackToTop ? current : shouldShowBackToTop);
        frame = 0;
      });
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const projects = useMemo(() => data.projects.filter((project) => {
    const matchesCategory = category === "all" || project.category === category ||
      (category === "security" && (project.category === "appsec" || project.category === "blue"));
    const searchable = [
      project.title_id, project.title_en, project.description_id,
      project.description_en, ...project.tech_stack,
    ].join(" ").toLocaleLowerCase();
    return matchesCategory && searchable.includes(query.trim().toLocaleLowerCase());
  }), [category, data.projects, query]);
  const certificates = useMemo(() => data.certificates.filter((certificate) =>
    `${certificate.title} ${certificate.issuer} ${certificate.category}`.toLocaleLowerCase().includes(certificateQuery.trim().toLocaleLowerCase()),
  ), [certificateQuery, data.certificates]);
  const competitions = useMemo(() => data.competitions.filter((competition) =>
    `${competition.name} ${competition.organizer} ${competition.achievement} ${competition.description_id} ${competition.description_en}`.toLocaleLowerCase().includes(competitionQuery.trim().toLocaleLowerCase()),
  ), [competitionQuery, data.competitions]);

  useEffect(() => {
    if (!("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.documentElement.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute("data-revealed", "true");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

    document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed='true'])")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [projects, certificates, competitions, data.experiences, data.articles]);

  const name = profile ? (locale === "id" ? profile.name_id : profile.name_en) : (locale === "id" ? "Nama Anda" : "Your Name");
  const title = profile ? (locale === "id" ? profile.title_id : profile.title_en) : "Junior Cybersecurity Engineer";
  const bio = profile ? (locale === "id" ? profile.bio_id : profile.bio_en) : "";
  const projectCategoryLabels: Record<(typeof projectCategoryKeys)[number], string> = {
    all: labels.all,
    website: labels.projectWebsite,
    game: labels.projectGame,
    security: labels.projectSecurity,
    research: labels.projectResearch,
    other: labels.projectOther,
  };
  const galleryLabels = { previous: labels.previousImage, next: labels.nextImage, image: labels.image };

  function changeTheme() {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.themeMotion = "switching";
    if (themeTimerRef.current !== null) window.clearTimeout(themeTimerRef.current);
    setTheme(next);
    themeTimerRef.current = window.setTimeout(() => {
      delete root.dataset.themeMotion;
      themeTimerRef.current = null;
    }, 650);
    try {
      window.localStorage.setItem("portfolio-theme", next);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
  }

  function changeLocale() {
    const next = locale === "id" ? "en" : "id";
    const root = document.documentElement;
    if (languageTimerRef.current !== null) window.clearTimeout(languageTimerRef.current);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      delete root.dataset.languageMotion;
      setLocale(next);
      return;
    }

    root.dataset.languageMotion = "running";
    languageTimerRef.current = window.setTimeout(() => {
      setLocale(next);
      languageTimerRef.current = window.setTimeout(() => {
        delete root.dataset.languageMotion;
        languageTimerRef.current = null;
      }, 340);
    }, 280);
  }

  return (
    <div className="portfolio-page">
      <div className="aurora-background" aria-hidden="true">
        <div className="aurora-background__layer" />
      </div>
      <a className="skip-link" href="#main">{labels.skip}</a>
      <header className="topbar">
        <nav className="nav shell" aria-label={locale === "id" ? "Navigasi utama" : "Main navigation"}>
          <a className="brand" href="#home" aria-label={locale === "id" ? "Beranda" : "Home"}>
            <span className="brand-mark" aria-hidden="true">N_</span>
            <span>{name.toLocaleUpperCase()}<span style={{ color: "var(--accent)" }}>.SEC</span></span>
          </a>
          <div className={`nav-links${mobileMenuOpen ? " mobile-open" : ""}`} id="primary-navigation">
            <a href="#about" aria-current={activeSection === "about" ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{labels.navAbout}</a><a href="#projects" aria-current={activeSection === "projects" ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{labels.navProjects}</a>
            <a href="#proof" aria-current={activeSection === "proof" ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{labels.navProof}</a><a href="#experience" aria-current={activeSection === "experience" ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{labels.navExperience}</a>
            <a href="#writing" aria-current={activeSection === "writing" ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{labels.navWriting}</a><a href="#contact" aria-current={activeSection === "contact" ? "location" : undefined} onClick={() => setMobileMenuOpen(false)}>{labels.navContact}</a>
          </div>
          <div className="nav-tools">
            <button className="tool-button mobile-menu-button" type="button" aria-controls="primary-navigation" aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? (locale === "id" ? "Tutup navigasi" : "Close navigation") : (locale === "id" ? "Buka navigasi" : "Open navigation")} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X aria-hidden="true" size={18} /> : <Menu aria-hidden="true" size={18} />}</button>
            <button className="tool-button" type="button" onClick={changeLocale} aria-label={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}>
              {locale === "id" ? "EN" : "ID"}
            </button>
            <button className="tool-button" type="button" onClick={changeTheme} aria-label={locale === "id" ? "Ubah tema" : "Toggle theme"} title={locale === "id" ? "Ubah tema" : "Toggle theme"}>
              <span className={`theme-icon theme-icon-${theme}`} aria-hidden="true">{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</span>
            </button>
          </div>
        </nav>
        <div className="reading-progress" aria-hidden="true" />
      </header>

      <main id="main">
        <div className="shell">
          {data.isDemo && <p className="notice" role="status">{labels.demoBanner}</p>}
          <section className="hero" id="home">
            <div className="hero-copy" data-reveal>
              <h1><BlurText text={labels.heroTitle} /><br /><span><BlurText text={labels.heroAccent} /></span></h1>
              <p className="hero-lead">{title}. {bio || labels.heroLead}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">{labels.viewWork} <span aria-hidden="true">↗</span></a>
                <a className="button button-quiet" href="#contact">{labels.contactCta} <span aria-hidden="true">→</span></a>
                {safeExternalUrl(profile?.cv_url ?? null) && <a className="button button-quiet hero-cv" href={safeExternalUrl(profile?.cv_url ?? null) ?? undefined} target="_blank" rel="noreferrer">{labels.downloadCv}</a>}
              </div>
              {data.isDemo && <p className="draft-note">{labels.noProfile}</p>}
            </div>
            <aside
              className="hero-profile"
              aria-label={`${labels.profileCard}: ${name}`}
              data-reveal
              onPointerMove={setProfileTilt}
              onPointerLeave={resetProfileTilt}
            >
              <div className="hero-portrait">
                {safeExternalUrl(profile?.photo_url ?? null) ? (
                  <Image className="hero-photo" src={safeExternalUrl(profile?.photo_url ?? null) ?? ""} alt={name} fill sizes="(max-width: 760px) 100vw, 42vw" unoptimized priority />
                ) : (
                  <div className="portrait-placeholder" aria-hidden="true"><span>N_</span><i>PROFILE / 01</i></div>
                )}
                <span className="portrait-label mono">{labels.profileDetails}</span>
              </div>
              <div className="hero-profile-info">
                <div className="hero-identity">
                  <h2>{name}</h2>
                  <p>{title}</p>
                </div>
                <div className="signal-row">
                  <div className="signal"><strong>{String(data.projects.length).padStart(2, "0")}</strong><span>{labels.projectCount}</span></div>
                  <div className="signal"><strong>{String(data.certificates.length + data.competitions.length).padStart(2, "0")}</strong><span>{labels.proofCount}</span></div>
                  <div className="signal"><strong>{String(data.articles.length).padStart(2, "0")}</strong><span>{labels.writingCount}</span></div>
                </div>
              </div>
            </aside>
          </section>

          <section id="about">
            <div className="section-head" data-reveal>
              <div><h2>{labels.aboutTitle}</h2></div>
              <p>{labels.aboutIntro}</p>
            </div>
            <div className="about-grid" data-reveal>
              <div className="about-stamp" aria-hidden="true"><span>{labels.observe}</span><i>→</i><span>{labels.analyze}</span><i>→</i><span>{labels.improve}</span></div>
              <div className="about-copy">
                <p>{bio || labels.noProfile}</p>
                <div className="skill-list" role="group" aria-label={locale === "id" ? "Bidang keahlian" : "Areas of interest"}>
                  {["Application Security", "Network Security", "CTF / Labs", "Security Operations"].map((skill, index) => (
                    <button className="tag" type="button" key={skill} aria-pressed={activeSkill === index} onClick={() => setActiveSkill(index)}>{skill}</button>
                  ))}
                </div>
                <p className="skill-note" aria-live="polite">{skillNotes[locale][activeSkill]}</p>
              </div>
            </div>
          </section>

          <section id="projects">
            <div className="section-head" data-reveal>
              <div><h2>{labels.projectsTitle}</h2></div>
              <p>{labels.projectsIntro}</p>
            </div>
            <div className="filter-row" role="group" aria-label={locale === "id" ? "Filter proyek" : "Filter projects"} data-reveal>
              {projectCategoryKeys.map((value) => (
                <button className="filter-button" type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{projectCategoryLabels[value]}</button>
              ))}
              <input className="filter-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchProjects} aria-label={labels.searchProjects} />
            </div>
            {projects.length ? <div className="grid-three">
              {projects.map((project) => <article className="content-card" key={project.id} data-reveal onPointerMove={setPointerSpotlight} onPointerLeave={resetPointerSpotlight}>
                <div className="eyebrow"><span>{projectCategoryLabels[project.category === "appsec" || project.category === "blue" ? "security" : project.category]} / PROJECT</span>{project.is_featured && <span>{labels.featured}</span>}</div>
                {safeMediaUrls([project.image_url, ...(project.media_urls ?? [])]).length > 0 && (
                  <MediaGallery
                    images={safeMediaUrls([project.image_url, ...(project.media_urls ?? [])])}
                    alt={locale === "id" ? project.title_id : project.title_en}
                    labels={galleryLabels}
                  />
                )}
                <h3>{locale === "id" ? project.title_id : project.title_en}</h3>
                <p>{locale === "id" ? project.description_id : project.description_en}</p>
                <div className="card-foot">{project.tech_stack.map((tech) => {
                  const normalizedTechnology = tech.trim().toLocaleLowerCase();
                  const logo = technologyLogos[normalizedTechnology]?.[theme];
                  const Logo = logo;
                  return <span className="mini-tag" key={tech}>{Logo && <Logo className={`tech-logo${normalizedTechnology === "next.js" || normalizedTechnology === "nextjs" ? " tech-logo-wordmark" : ""}`} aria-hidden="true" />}{tech}</span>;
                })}</div>
                <div className="card-foot">
                  {safeExternalUrl(project.repo_url) && <a className="card-link" href={safeExternalUrl(project.repo_url) ?? undefined} target="_blank" rel="noreferrer">{labels.openRepo}</a>}
                  {safeExternalUrl(project.demo_url) && <a className="card-link" href={safeExternalUrl(project.demo_url) ?? undefined} target="_blank" rel="noreferrer">{labels.liveDemo}</a>}
                </div>
              </article>)}
            </div> : <p className="notice">{data.projects.length ? labels.noMatches : labels.noProjects}</p>}
          </section>

          <section id="proof">
            <div className="section-head" data-reveal><div><h2>{labels.proofTitle}</h2></div></div>
            <div className="proof-filters" data-reveal>
              <input className="filter-search" type="search" value={certificateQuery} onChange={(event) => setCertificateQuery(event.target.value)} placeholder={labels.searchCertificates} aria-label={labels.searchCertificates} />
              <input className="filter-search" type="search" value={competitionQuery} onChange={(event) => setCompetitionQuery(event.target.value)} placeholder={labels.searchCompetitions} aria-label={labels.searchCompetitions} />
            </div>
            <div className="grid-three">
              {certificates.length ? certificates.map((certificate) => <article className="content-card" key={certificate.id} data-reveal onPointerMove={setPointerSpotlight} onPointerLeave={resetPointerSpotlight}>
                <div className="eyebrow"><span>{certificate.category.toUpperCase()}</span>{certificate.is_featured && <span>{labels.featured}</span>}</div>
                {safeMediaUrls([certificate.image_url, ...(certificate.media_urls ?? [])]).length > 0 && (
                  <MediaGallery
                    images={safeMediaUrls([certificate.image_url, ...(certificate.media_urls ?? [])])}
                    alt={certificate.title}
                    labels={galleryLabels}
                  />
                )}
                <h3>{certificate.title}</h3><p>{certificate.issuer}{certificate.issue_date ? ` · ${formatDate(certificate.issue_date, locale)}` : ""}</p>
                <div className="card-foot">{safeExternalUrl(certificate.credential_url) && <a className="card-link" href={safeExternalUrl(certificate.credential_url) ?? undefined} target="_blank" rel="noreferrer">{labels.verify}</a>}{safeExternalUrl(certificate.document_url) && <a className="card-link" href={safeExternalUrl(certificate.document_url) ?? undefined} target="_blank" rel="noreferrer">{labels.certificateDocument}</a>}</div>
              </article>) : <article className="content-card empty-card"><span className="mono">{labels.certs}</span><h3>{data.certificates.length ? labels.noMatches : labels.noCertificates}</h3></article>}
              {competitions.length ? competitions.map((competition) => <article className="content-card" key={competition.id} data-reveal onPointerMove={setPointerSpotlight} onPointerLeave={resetPointerSpotlight}>
                <div className="eyebrow"><span>CTF / COMPETITION</span>{competition.is_featured && <span>{labels.featured}</span>}</div>
                {safeMediaUrls(competition.media_urls ?? []).length > 0 && (
                  <MediaGallery
                    images={safeMediaUrls(competition.media_urls ?? [])}
                    alt={competition.name}
                    labels={galleryLabels}
                  />
                )}
                <h3>{competition.name}</h3><p>{competition.organizer}{competition.date ? ` · ${formatDate(competition.date, locale)}` : ""}</p>
                <p>{competition.achievement}</p><p>{locale === "id" ? competition.description_id : competition.description_en}</p>
                <div className="card-foot">{safeExternalUrl(competition.ctf_writeup_url) && <a className="card-link" href={safeExternalUrl(competition.ctf_writeup_url) ?? undefined} target="_blank" rel="noreferrer">{labels.readWriteup}</a>}</div>
              </article>) : <article className="content-card empty-card"><span className="mono">{labels.competitions}</span><h3>{data.competitions.length ? labels.noMatches : labels.noCompetitions}</h3></article>}
            </div>
          </section>

          <section id="experience">
            <div className="section-head" data-reveal><div><h2>{labels.experienceTitle}</h2></div></div>
            {data.experiences.length ? <div className="timeline">
              {data.experiences.map((experience) => <article className="timeline-item" key={experience.id} data-reveal>
                <span className="date">{formatDate(experience.start_date, locale)} — {experience.end_date ? formatDate(experience.end_date, locale) : (locale === "id" ? "SEKARANG" : "PRESENT")}</span>
                <span className="experience-type">{labels[experienceTypeLabels[experience.experience_type] ?? "experienceOther"]}</span>
                <h3>{locale === "id" ? experience.role_id : experience.role_en}</h3>
                <p>{experience.company} · {locale === "id" ? experience.description_id : experience.description_en}</p>
                {safeMediaUrls(experience.media_urls ?? []).length > 0 && (
                  <MediaGallery
                    images={safeMediaUrls(experience.media_urls ?? [])}
                    alt={locale === "id" ? experience.role_id : experience.role_en}
                    labels={galleryLabels}
                  />
                )}
              </article>)}
            </div> : <p className="notice">{labels.noExperience}</p>}
          </section>

          <section id="writing">
            <div className="section-head" data-reveal>
              <div><h2>{labels.writingTitle}</h2></div>
              <p>{labels.writingIntro}</p>
            </div>
            {data.articles.length ? <div className="grid-three">
              {data.articles.map((article) => <article className="content-card" key={article.id} data-reveal onPointerMove={setPointerSpotlight} onPointerLeave={resetPointerSpotlight}>
                <div className="eyebrow"><span>{article.published_at ? formatDate(article.published_at, locale) : "WRITE-UP"}</span></div>
                {safeMediaUrls(article.media_urls ?? []).length > 0 && (
                  <MediaGallery
                    images={safeMediaUrls(article.media_urls ?? [])}
                    alt={locale === "id" ? article.title_id : article.title_en}
                    labels={galleryLabels}
                  />
                )}
                <h3>{locale === "id" ? article.title_id : article.title_en}</h3>
                <p>{locale === "id" ? article.excerpt_id : article.excerpt_en}</p>
                <div className="card-foot">{article.tags.map((tag) => <span className="mini-tag" key={tag}>{tag}</span>)}</div>
                <div className="card-foot"><Link className="card-link" href={`/writeups/${article.slug}`}>{labels.readMore}</Link></div>
              </article>)}
            </div> : <p className="notice">{labels.noArticles}</p>}
          </section>

          <section id="contact">
            <div className="contact-box" data-reveal>
              <div><h2>{labels.contactTitle}</h2><p>{labels.contactText}</p></div>
              <div className="hero-actions">
                {profile?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) && <a className="button button-primary" href={`mailto:${encodeURIComponent(profile.email)}`}>{labels.email} ↗</a>}
                {safeExternalUrl(profile?.linkedin ?? null) && <a className="button button-quiet" href={safeExternalUrl(profile?.linkedin ?? null) ?? undefined} target="_blank" rel="noreferrer">{labels.linkedin} ↗</a>}
                {safeExternalUrl(profile?.github ?? null) && <a className="button button-quiet" href={safeExternalUrl(profile?.github ?? null) ?? undefined} target="_blank" rel="noreferrer">{labels.github} ↗</a>}
                {!profile?.email && !profile?.linkedin && !profile?.github && <p className="contact-setup">{labels.contactSetup}</p>}
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer><div className="shell footer-row"><span>© {new Date().getFullYear()} {name.toLocaleUpperCase()} · SECURITY PORTFOLIO</span><span>{labels.footer}</span><Link href="/admin">{labels.admin}</Link></div></footer>
      <a className={`back-to-top${showBackToTop ? " is-visible" : ""}`} href="#home" aria-label={locale === "id" ? "Kembali ke atas" : "Back to top"} tabIndex={showBackToTop ? 0 : -1}>↑</a>
    </div>
  );
}
