"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Locale, PortfolioData } from "@/lib/types";

const text = {
  id: {
    skip: "Lewati ke konten", navAbout: "Tentang", navProjects: "Proyek",
    navProof: "Kredensial", navExperience: "Pengalaman", navWriting: "Write-up",
    navContact: "Kontak", availability: "Portofolio cybersecurity",
    heroTitle: "Membangun pertahanan.", heroAccent: "Memahami ancaman.",
    heroLead: "Keamanan praktis, pembelajaran berkelanjutan, dan sistem yang lebih tangguh.",
    viewWork: "Jelajahi karya", contactCta: "Hubungi saya", profileCard: "Profil / ringkas",
    aboutEyebrow: "01 / Tentang", aboutTitle: "Keamanan dimulai dari rasa ingin tahu.",
    aboutIntro: "Kemampuan teknis, cara berpikir, dan pengalaman yang bisa diverifikasi.",
    projectsEyebrow: "02 / Pilihan karya", projectsTitle: "Belajar dengan membangun.",
    projectsIntro: "Proyek keamanan yang menjelaskan tujuan, kontribusi, teknologi, dan hasilnya.",
    all: "Semua", searchProjects: "Cari proyek atau teknologi...",
    searchCertificates: "Cari sertifikat...", searchCompetitions: "Cari kompetisi...",
    noMatches: "Tidak ada hasil yang cocok dengan filter.",
    noProjects: "Belum ada proyek terpublikasi.", proofEyebrow: "03 / Bukti kemampuan",
    proofTitle: "Kredibilitas, bukan klaim.", certs: "Sertifikat", competitions: "Kompetisi & CTF",
    noCertificates: "Belum ada sertifikat terpublikasi.", noCompetitions: "Belum ada kompetisi terpublikasi.",
    verify: "VERIFIKASI ↗", readWriteup: "BACA WRITE-UP ↗",
    experienceEyebrow: "04 / Perjalanan", experienceTitle: "Pengalaman & pendidikan.",
    noExperience: "Pengalaman dan pendidikan akan ditampilkan di sini.",
    writingEyebrow: "05 / Berbagi pengetahuan", writingTitle: "Write-up & catatan.",
    writingIntro: "Catatan teknis dan write-up CTF yang dapat dibagikan secara bertanggung jawab.",
    readMore: "Baca write-up →", noArticles: "Belum ada write-up terpublikasi.",
    contactEyebrow: "06 / Kontak", contactTitle: "Mari bicara soal keamanan.",
    contactText: "Terbuka untuk percakapan seputar cybersecurity, kolaborasi, dan peluang profesional.",
    email: "Email", linkedin: "LinkedIn", github: "GitHub", downloadCv: "Unduh CV ↗",
    admin: "Admin", footer: "Dibuat dengan rasa ingin tahu & niat baik.",
    demoBanner: "Mode pratinjau: hubungkan Supabase untuk mengelola data dan menampilkan profil Anda.",
    featured: "UNGGULAN", openRepo: "REPOSITORY ↗", liveDemo: "DEMO ↗",
    noProfile: "Lengkapi profil Anda melalui panel admin.",
    contactSetup: "Tambahkan tautan kontak melalui panel admin.",
  },
  en: {
    skip: "Skip to content", navAbout: "About", navProjects: "Projects",
    navProof: "Credentials", navExperience: "Experience", navWriting: "Write-ups",
    navContact: "Contact", availability: "Cybersecurity portfolio",
    heroTitle: "Building defenses.", heroAccent: "Understanding threats.",
    heroLead: "Practical security, continuous learning, and building more resilient systems.",
    viewWork: "Explore my work", contactCta: "Get in touch", profileCard: "Profile / overview",
    aboutEyebrow: "01 / About", aboutTitle: "Security starts with curiosity.",
    aboutIntro: "Technical ability, thoughtful problem-solving, and verifiable experience.",
    projectsEyebrow: "02 / Selected work", projectsTitle: "Learning by building.",
    projectsIntro: "Security work that explains its goal, your contribution, technology, and outcome.",
    all: "All", searchProjects: "Search projects or technology...",
    searchCertificates: "Search certifications...", searchCompetitions: "Search competitions...",
    noMatches: "No results match these filters.",
    noProjects: "No published projects yet.", proofEyebrow: "03 / Evidence",
    proofTitle: "Credibility, not claims.", certs: "Certifications", competitions: "Competitions & CTFs",
    noCertificates: "No published certifications yet.", noCompetitions: "No published competitions yet.",
    verify: "VERIFY ↗", readWriteup: "READ WRITE-UP ↗",
    experienceEyebrow: "04 / Journey", experienceTitle: "Experience & education.",
    noExperience: "Experience and education will appear here.",
    writingEyebrow: "05 / Knowledge sharing", writingTitle: "Write-ups & notes.",
    writingIntro: "Technical notes and CTF write-ups shared responsibly.",
    readMore: "Read write-up →", noArticles: "No published write-ups yet.",
    contactEyebrow: "06 / Contact", contactTitle: "Let’s talk security.",
    contactText: "Open to conversations about cybersecurity, collaboration, and professional opportunities.",
    email: "Email", linkedin: "LinkedIn", github: "GitHub", downloadCv: "Download CV ↗",
    admin: "Admin", footer: "Built with curiosity & good intent.",
    demoBanner: "Preview mode: connect Supabase to manage content and publish your profile.",
    featured: "FEATURED", openRepo: "REPOSITORY ↗", liveDemo: "LIVE DEMO ↗",
    noProfile: "Complete your profile in the admin panel.",
    contactSetup: "Add contact links in the admin panel.",
  },
} as const;

function safeExternalUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function formatDate(value: string | null, locale: Locale) {
  if (!value) return "";
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

export function Portfolio({ data }: { data: PortfolioData }) {
  const [locale, setLocale] = useState<Locale>("id");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [certificateQuery, setCertificateQuery] = useState("");
  const [competitionQuery, setCompetitionQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
    document.title = `${profile ? (locale === "id" ? profile.name_id : profile.name_en) : "Cybersecurity Engineer"} — Portfolio`;
  }, [locale, profile, theme]);

  const projects = useMemo(() => data.projects.filter((project) => {
    const matchesCategory = category === "all" || project.category === category;
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

  const name = profile ? (locale === "id" ? profile.name_id : profile.name_en) : (locale === "id" ? "Nama Anda" : "Your Name");
  const title = profile ? (locale === "id" ? profile.title_id : profile.title_en) : "Junior Cybersecurity Engineer";
  const bio = profile ? (locale === "id" ? profile.bio_id : profile.bio_en) : "";

  function changeTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      window.localStorage.setItem("portfolio-theme", next);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">{labels.skip}</a>
      <header className="topbar">
        <nav className="nav shell" aria-label={locale === "id" ? "Navigasi utama" : "Main navigation"}>
          <a className="brand" href="#home" aria-label={locale === "id" ? "Beranda" : "Home"}>
            <span className="brand-mark" aria-hidden="true">N_</span>
            <span>{name.toLocaleUpperCase()}<span style={{ color: "var(--accent)" }}>.SEC</span></span>
          </a>
          <div className={`nav-links${mobileMenuOpen ? " mobile-open" : ""}`}>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>{labels.navAbout}</a><a href="#projects" onClick={() => setMobileMenuOpen(false)}>{labels.navProjects}</a>
            <a href="#proof" onClick={() => setMobileMenuOpen(false)}>{labels.navProof}</a><a href="#experience" onClick={() => setMobileMenuOpen(false)}>{labels.navExperience}</a>
            <a href="#writing" onClick={() => setMobileMenuOpen(false)}>{labels.navWriting}</a><a href="#contact" onClick={() => setMobileMenuOpen(false)}>{labels.navContact}</a>
          </div>
          <div className="nav-tools">
            <button className="tool-button mobile-menu-button" type="button" aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
            <button className="tool-button" type="button" onClick={() => setLocale(locale === "id" ? "en" : "id")} aria-label={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}>
              {locale === "id" ? "EN" : "ID"}
            </button>
            <button className="tool-button" type="button" onClick={changeTheme} aria-label={locale === "id" ? "Ubah tema" : "Toggle theme"} title={locale === "id" ? "Ubah tema" : "Toggle theme"}>◐</button>
          </div>
        </nav>
      </header>

      <main id="main">
        <div className="shell">
          {data.isDemo && <p className="notice" role="status">{labels.demoBanner}</p>}
          <section className="hero" id="home" style={{ border: 0 }}>
            <div className="hero-copy">
              <div className="availability">{labels.availability}</div>
              <h1>{labels.heroTitle}<br /><span>{labels.heroAccent}</span></h1>
              <p className="hero-lead">{title}. {bio || labels.heroLead}</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#projects">{labels.viewWork} <span aria-hidden="true">↗</span></a>
                <a className="button button-quiet" href="#contact">{labels.contactCta} <span aria-hidden="true">→</span></a>
                {safeExternalUrl(profile?.cv_url ?? null) && <a className="button button-quiet" href={safeExternalUrl(profile?.cv_url ?? null) ?? undefined} target="_blank" rel="noreferrer">{labels.downloadCv}</a>}
              </div>
              {data.isDemo && <p className="draft-note">{labels.noProfile}</p>}
            </div>
            <aside className="hero-card" aria-label={labels.profileCard}>
              <div className="card-top"><span className="mono">{labels.profileCard}</span><span>SYS.01</span></div>
              <div className="terminal">
                <p><span className="value">01</span> <strong>role</strong> : &quot;{title}&quot;</p>
                <p><span className="value">02</span> <strong>focus</strong> : &quot;Defensive Security&quot;</p>
                <p><span className="value">03</span> <strong>approach</strong> : &quot;Learn · Test · Improve&quot;</p>
                <p><span className="value">04</span> <strong>status</strong> : &quot;Security-minded&quot;</p>
              </div>
              <div className="signal-row">
                <div className="signal"><strong>{String(data.projects.length).padStart(2, "0")}</strong><span>PROJECTS</span></div>
                <div className="signal"><strong>{String(data.certificates.length + data.competitions.length).padStart(2, "0")}</strong><span>PROOF</span></div>
                <div className="signal"><strong>{String(data.articles.length).padStart(2, "0")}</strong><span>WRITE-UPS</span></div>
              </div>
            </aside>
          </section>

          <section id="about">
            <div className="section-head">
              <div><span className="mono">{labels.aboutEyebrow}</span><h2>{labels.aboutTitle}</h2></div>
              <p>{labels.aboutIntro}</p>
            </div>
            <div className="about-grid">
              <div className="about-stamp">{safeExternalUrl(profile?.photo_url ?? null) ? <img className="profile-photo" src={safeExternalUrl(profile?.photo_url ?? null) ?? undefined} alt={name} loading="lazy" /> : <span aria-hidden="true">[ PROFILE ]</span>}</div>
              <div className="about-copy">
                <p>{bio || labels.noProfile}</p>
                <div className="skill-list">
                  {["Application Security", "Network Security", "CTF / Labs", "Security Operations"].map((skill) => <span className="tag" key={skill}>{skill}</span>)}
                </div>
              </div>
            </div>
          </section>

          <section id="projects">
            <div className="section-head">
              <div><span className="mono">{labels.projectsEyebrow}</span><h2>{labels.projectsTitle}</h2></div>
              <p>{labels.projectsIntro}</p>
            </div>
            <div className="filter-row" role="group" aria-label={locale === "id" ? "Filter proyek" : "Filter projects"}>
              {[["all", labels.all], ["appsec", "AppSec"], ["blue", "Blue team"], ["research", "Research"]].map(([value, label]) => (
                <button className="filter-button" type="button" key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{label}</button>
              ))}
              <input className="filter-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.searchProjects} aria-label={labels.searchProjects} />
            </div>
            {projects.length ? <div className="grid-three">
              {projects.map((project) => <article className="content-card" key={project.id}>
                <div className="eyebrow"><span>{project.category.toUpperCase()} / PROJECT</span>{project.is_featured && <span>{labels.featured}</span>}</div>
                <h3>{locale === "id" ? project.title_id : project.title_en}</h3>
                <p>{locale === "id" ? project.description_id : project.description_en}</p>
                <div className="card-foot">{project.tech_stack.map((tech) => <span className="mini-tag" key={tech}>{tech}</span>)}</div>
                <div className="card-foot">
                  {safeExternalUrl(project.repo_url) && <a className="card-link" href={safeExternalUrl(project.repo_url) ?? undefined} target="_blank" rel="noreferrer">{labels.openRepo}</a>}
                  {safeExternalUrl(project.demo_url) && <a className="card-link" href={safeExternalUrl(project.demo_url) ?? undefined} target="_blank" rel="noreferrer">{labels.liveDemo}</a>}
                </div>
              </article>)}
            </div> : <p className="notice">{data.projects.length ? labels.noMatches : labels.noProjects}</p>}
          </section>

          <section id="proof">
            <div className="section-head"><div><span className="mono">{labels.proofEyebrow}</span><h2>{labels.proofTitle}</h2></div></div>
            <div className="proof-filters">
              <input className="filter-search" type="search" value={certificateQuery} onChange={(event) => setCertificateQuery(event.target.value)} placeholder={labels.searchCertificates} aria-label={labels.searchCertificates} />
              <input className="filter-search" type="search" value={competitionQuery} onChange={(event) => setCompetitionQuery(event.target.value)} placeholder={labels.searchCompetitions} aria-label={labels.searchCompetitions} />
            </div>
            <div className="grid-three">
              {certificates.length ? certificates.map((certificate) => <article className="content-card" key={certificate.id}>
                <div className="eyebrow"><span>{certificate.category.toUpperCase()}</span>{certificate.is_featured && <span>{labels.featured}</span>}</div>
                <h3>{certificate.title}</h3><p>{certificate.issuer}{certificate.issue_date ? ` · ${formatDate(certificate.issue_date, locale)}` : ""}</p>
                <div className="card-foot">{safeExternalUrl(certificate.credential_url) && <a className="card-link" href={safeExternalUrl(certificate.credential_url) ?? undefined} target="_blank" rel="noreferrer">{labels.verify}</a>}</div>
              </article>) : <article className="content-card empty-card"><span className="mono">{labels.certs}</span><h3>{data.certificates.length ? labels.noMatches : labels.noCertificates}</h3></article>}
              {competitions.length ? competitions.map((competition) => <article className="content-card" key={competition.id}>
                <div className="eyebrow"><span>CTF / COMPETITION</span>{competition.is_featured && <span>{labels.featured}</span>}</div>
                <h3>{competition.name}</h3><p>{competition.organizer}{competition.date ? ` · ${formatDate(competition.date, locale)}` : ""}</p>
                <p>{competition.achievement}</p><p>{locale === "id" ? competition.description_id : competition.description_en}</p>
                <div className="card-foot">{safeExternalUrl(competition.ctf_writeup_url) && <a className="card-link" href={safeExternalUrl(competition.ctf_writeup_url) ?? undefined} target="_blank" rel="noreferrer">{labels.readWriteup}</a>}</div>
              </article>) : <article className="content-card empty-card"><span className="mono">{labels.competitions}</span><h3>{data.competitions.length ? labels.noMatches : labels.noCompetitions}</h3></article>}
            </div>
          </section>

          <section id="experience">
            <div className="section-head"><div><span className="mono">{labels.experienceEyebrow}</span><h2>{labels.experienceTitle}</h2></div></div>
            {data.experiences.length ? <div className="timeline">
              {data.experiences.map((experience) => <article className="timeline-item" key={experience.id}>
                <span className="date">{formatDate(experience.start_date, locale)} — {experience.end_date ? formatDate(experience.end_date, locale) : (locale === "id" ? "SEKARANG" : "PRESENT")}</span>
                <h3>{locale === "id" ? experience.role_id : experience.role_en}</h3>
                <p>{experience.company} · {locale === "id" ? experience.description_id : experience.description_en}</p>
              </article>)}
            </div> : <p className="notice">{labels.noExperience}</p>}
          </section>

          <section id="writing">
            <div className="section-head">
              <div><span className="mono">{labels.writingEyebrow}</span><h2>{labels.writingTitle}</h2></div>
              <p>{labels.writingIntro}</p>
            </div>
            {data.articles.length ? <div className="grid-three">
              {data.articles.map((article) => <article className="content-card" key={article.id}>
                <div className="eyebrow"><span>{article.published_at ? formatDate(article.published_at, locale) : "WRITE-UP"}</span></div>
                <h3>{locale === "id" ? article.title_id : article.title_en}</h3>
                <p>{locale === "id" ? article.excerpt_id : article.excerpt_en}</p>
                <div className="card-foot">{article.tags.map((tag) => <span className="mini-tag" key={tag}>{tag}</span>)}</div>
                <div className="card-foot"><Link className="card-link" href={`/writeups/${article.slug}`}>{labels.readMore}</Link></div>
              </article>)}
            </div> : <p className="notice">{labels.noArticles}</p>}
          </section>

          <section id="contact">
            <div className="contact-box">
              <div><span className="mono">{labels.contactEyebrow}</span><h2>{labels.contactTitle}</h2><p>{labels.contactText}</p></div>
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
    </>
  );
}
