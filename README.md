# Cybersecurity Engineer Portfolio

Bilingual (Bahasa Indonesia / English) cybersecurity portfolio built with Next.js App Router and Neon. It includes a public portfolio, a single-owner content dashboard, searchable content, Markdown write-ups, and Vercel Analytics.

## Repository structure

```text
.
├── frontend/                  # Next.js public site, API routes, and /admin
│   ├── app/                    # Pages and server-side API routes
│   ├── components/
│   │   ├── admin/              # Content management dashboard
│   │   └── portfolio/          # Public site and write-up views
│   ├── lib/
│   │   ├── admin/              # Admin API validation
│   │   ├── auth/               # Neon Managed Auth clients
│   │   ├── database/           # Neon PostgreSQL connection
│   │   └── portfolio/          # Public portfolio queries
│   └── .env.example             # Safe environment-variable template
├── backend/
│   ├── neon/migrations/         # PostgreSQL schema for Neon
├── docs/                       # PRD and architecture notes
├── .github/skills/              # Reusable visual-design skill and references
└── package.json                # npm workspace and root commands
```

`frontend/` is the deployable Next.js application. Database credentials stay server-side; public pages read published rows through the Neon driver, while dashboard CRUD is handled by authenticated Next.js API routes.

## Neon setup

1. Create a Neon project in an AWS region. Singapore (`aws-ap-southeast-1`) supports both Managed Auth and Object Storage.
2. Open the project's **Auth** page for the branch and enable Managed Better Auth. Configure email/password sign-in and allowed origins for `http://localhost:3000` and your production domain.
3. In **Connect**, select the branch, database, and role, then copy the pooled connection string.
4. Copy `frontend/.env.example` to `frontend/.env.local` and set `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `ADMIN_EMAIL`, and `NEXT_PUBLIC_SITE_URL`. Generate the cookie secret with `openssl rand -base64 32`. Set `ADMIN_EMAIL` to the one email address that should own the dashboard.
5. In Neon SQL Editor, paste [`backend/neon/migrations/202610080001_initial_portfolio.sql`](./backend/neon/migrations/202610080001_initial_portfolio.sql) and click **Run** (not **Explain**). `EXPLAIN` is only for supported query statements; it cannot execute DDL such as `CREATE TABLE`. This schema uses PostgreSQL's built-in `gen_random_uuid()` and does not need an extension.
6. For uploads, create a `public_read` Neon Object Storage bucket named `portfolio-assets` and a storage credential with read/write scope. Set the `AWS_*` and `PORTFOLIO_ASSETS_BUCKET` variables shown in `.env.example`. Public-read is intentional for portfolio images and downloadable CV files; never upload private documents.
7. Install and run the app:

   ```sh
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`. The site remains in preview mode until `DATABASE_URL` is set. In Neon Auth Configuration, temporarily enable email/password sign-up. Then set `ALLOW_ADMIN_SIGNUP=true`; `/admin` only permits registration for `ADMIN_EMAIL`. After creating the owner account, turn off sign-up in Neon Auth, set `ALLOW_ADMIN_SIGNUP=false`, and restart the app.

Never commit `.env.local`, put credentials in `NEXT_PUBLIC_*`, or send a connection string or storage secret in chat. If a credential was accidentally copied into a tracked file, rotate it in Neon.

## Deployment

1. Set the Vercel Root Directory to `frontend`.
2. Add the same server-side Neon/Auth variables to the Vercel project. Add storage variables only if uploads are enabled.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain, deploy, then verify `/`, `/admin`, `/robots.txt`, `/sitemap.xml`, and a published write-up.
4. Restrict Neon Auth allowed origins to the production app domain. Keep `ALLOW_ADMIN_SIGNUP=false` after the owner account is created.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
```

For the data flow and security boundary, see [docs/architecture.md](./docs/architecture.md) and [backend/README.md](./backend/README.md). The original requirements are in [docs/PRD_Portfolio_Cybersecurity_Engineer.md](./docs/PRD_Portfolio_Cybersecurity_Engineer.md).

This repository also includes the [Visual Design Director skill](./.github/skills/visual-design-director/SKILL.md). Repository-level Copilot instructions invoke it for visual deliverables and keep the design critique internal unless requested.
