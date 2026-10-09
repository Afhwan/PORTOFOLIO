---
version: 1
slug: "components-portfolio-site-tsx"
primary_target: "components/portfolio/site.tsx"
related_targets: ["components/admin/panel.tsx","components/portfolio/writeup.tsx"]
---

## Scope and visitor mode

The public portfolio and write-up pages use Experience mode; `/admin` and sign-in use Operate mode. Apply one evidence-catalog language across the complete frontend.

## Audience, task, proof, constraints

Recruiters and hiring managers assess the owner's cybersecurity profile, projects, credentials, experience, and writing, then contact the owner or open the CV. The owner manages this same published evidence through the authenticated dashboard. Use only real profile/content/media data. Preserve the current routes, Neon reads and writes, single-owner auth boundary, ID/EN, light/dark theme, search/filter, SEO, responsive behavior, and uploads. Use 21st.dev components as the source for the focal profile hero and responsive dashboard navigation; adapt them to the app rather than importing hard-coded demo content. Motion is focused and interactive, with reduced-motion support.

## Direction contract

### THESIS

Make professional evidence feel browsable and verifiable, not hidden in a generic grid or disguised as a cyber terminal.

### OWN-WORLD

An evidence index with clear record titles, compact accession cues, real media, and a restrained signal palette derived from the existing theme. The 21st.dev portfolio hero supplies a portrait-led, blur-reveal rhythm; the responsive admin sidebar supplies a morphing navigation pattern. Keep all categories and actions legible without color or hover.

### STORY

Recruiters meet the real person first, understand their role, then explore published projects, credentials, experience, and writing with direct routes to CV and contact. The owner sees a familiar, compact record-management workspace, not an animated showcase in the middle of a task.

### FIRST VIEWPORT

Use the existing header and theme/language controls. Below it, place the owner's real name and role as the strongest text, one concise bio, visible CV/contact actions, and the actual portrait in a responsive framed profile surface. Let the aurora remain atmospheric behind the content; its motion must not compete with text or controls. The next section begins in the first scroll as a readable evidence index.

### FORM

Public mode is Experience; dashboard and sign-in are Operate. Adapt the 21st.dev Portfolio Hero (demo 9037) and Animated Sidebar (demo 29334) to real data, the app's design tokens, existing routes, and keyboard/touch behavior. Use the same record grammar for projects, certificates, competitions, experiences, and write-ups, with 21st.dev-style spotlight/tilt interaction on evidence records and keyboard-navigable image galleries. Keep forms and authentication calm and task-focused. Seed key: `d0921ee5`; assigned catalog-sleeve direction fused with the evidence clarity of the 21st.dev portfolio hero.

### FINISH

unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

No new claims, profile imagery, credentials, or portfolio content may be invented. Keep existing published media and official technology marks; no new raster imagery is planned.
