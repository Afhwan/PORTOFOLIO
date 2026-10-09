# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers evaluating a junior cybersecurity engineer, with Indonesian and international visitors as the primary audiences. The portfolio owner is the sole admin user.

## Product Purpose

Present the owner's cybersecurity profile, work, credentials, competitions, experience, and technical writing as a trustworthy professional portfolio. Let recruiters assess fit and contact the owner; let the owner maintain published content without editing code.

## Positioning

A bilingual, evidence-led portfolio whose public content is managed by its owner through a single-user dashboard.

## Operating Context

Recruiters browse the public portfolio for professional evidence, CV, and contact details. The owner signs in to `/admin` to manage content and uploads. Visitors can switch between Indonesian and English and between light and dark themes.

## Capabilities and Constraints

- Public pages show published profiles, certificates, competitions, projects, experience, and write-ups; project and credential content supports search and filtering.
- The single-owner dashboard provides authenticated content management and optional public-asset uploads.
- Preserve existing routes, database-backed content, bilingual behavior, theme switching, authentication, authorization, CRUD behavior, and SEO during the frontend redesign.
- For the requested frontend redesign, source UI components and visual assets from 21st.dev where they fit the existing Next.js 15, React 19, TypeScript, and Tailwind CSS 4 application.
- Motion should be visibly interactive but purposeful, remain responsive and performant, and respect reduced-motion preferences.
- Keep database, authentication, and storage credentials server-side. Public visitors do not connect directly to Neon.

## Evidence on Hand

- Product requirements and personas: `../docs/PRD_Portfolio_Cybersecurity_Engineer.md`.
- Application and authorization architecture: `../docs/architecture.md` and `../backend/README.md`.
- Published portfolio content, owner profile, and contact links are stored in Neon and rendered from the existing public queries.
- Existing Next.js App Router, admin dashboard, write-up pages, styles, and UI source are in this frontend package.

## Product Principles

- Lead with verifiable evidence instead of unsupported claims.
- Keep public portfolio content easy to assess in either supported language.
- Make content maintenance practical for one owner.
- Preserve the security boundary between visitors, the owner, and server credentials.
- Keep interactive experiences accessible and usable across devices.
