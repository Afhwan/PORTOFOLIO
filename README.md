# Cybersecurity Engineer Portfolio

Bilingual (Bahasa Indonesia / English) cybersecurity portfolio built with Next.js App Router, Supabase, and Vercel. This implementation covers the PRD's public site, authenticated content dashboard, search/filtering, Markdown write-ups, and basic Vercel Analytics integration.

## Repository structure

```text
.
├── frontend/                    # Next.js public site and /admin app
│   ├── app/                      # App Router routes, metadata, styles
│   ├── components/               # Public portfolio, admin, write-up UI
│   ├── lib/                      # Supabase clients, data loading, types
│   ├── next.config.ts            # Frontend security headers / Next.js config
│   ├── middleware.ts             # Supabase auth token refresh
│   ├── package.json              # Frontend dependencies and scripts
│   └── .env.example              # Frontend environment template
├── backend/
│   ├── README.md                 # Supabase setup instructions
│   └── supabase/migrations/       # PostgreSQL schema, RLS and Storage policies
├── docs/                         # PRD and architecture notes
├── package.json                  # npm workspace and root commands
└── README.md
```

`backend/` contains the Supabase/PostgreSQL backend definition. There is no separate Express server: Next.js calls Supabase REST/Auth/Storage directly, and PostgreSQL RLS enforces authorization. This keeps the Vercel deployment simple without weakening database-side access controls.

The visual system uses a small set of custom CSS design tokens instead of Tailwind utility classes to preserve the portfolio's distinct terminal-inspired visual language without adding a utility build layer.

## Local development

1. Install Node.js 20.9 or newer.
2. Install workspace packages from the repository root with `npm install`.
3. Copy `frontend/.env.example` to `frontend/.env.local` and set the Supabase project URL, anon key, and public site URL.
4. Run the SQL migration in `backend/supabase/migrations/202610070001_initial_portfolio.sql` using the Supabase SQL Editor.
5. Create the single owner account in Supabase Authentication. Disable public sign-ups.
6. Copy that account's UUID from Supabase Authentication and add it to the admin allowlist:

   ```sql
   insert into public.admins (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

7. Run `npm run dev` from the repository root and open `http://localhost:3000`.

The website is in an explicit preview mode while Supabase is not configured; it does not claim that local demo content is persisted. After configuration, an empty database renders empty states until content is added in `/admin`.

## Content and access control

The owner dashboard at `/admin` uses Supabase Auth email/password. `public.admins` is an explicit allowlist; successfully authenticating is not sufficient for admin access. PostgreSQL Row Level Security is the authorization boundary: anonymous visitors can only read published rows, and only allowlisted users can create, update, or delete content. Never add a Supabase `service_role` key to this project or to a `NEXT_PUBLIC_*` variable.

The dashboard manages the profile (one row), certificates, competitions/CTFs, projects, experience/education, and Markdown articles. Featured and publish toggles, bilingual content fields, image/CV upload, and a Markdown preview are included. Storage uploads are limited to 5 MB and JPG, PNG, WebP, or PDF; access is checked by Storage RLS policies. The `portfolio-assets` bucket is public-read by design because certificates and the downloadable CV are public portfolio assets.

Public project search and category filters, certificate and competition search, bilingual section labels, theme switching, responsive navigation, article metadata, sitemap, robots rules, and the admin `noindex` directive are implemented.

## Deploy to Vercel

1. Create a Vercel project connected to this repository and set the project Root Directory to `frontend`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` for production and preview environments as appropriate.
3. Deploy using the Next.js preset. Vercel Analytics is included; enable it in the Vercel project dashboard.
4. Set the production domain in `NEXT_PUBLIC_SITE_URL`, redeploy, and verify `/sitemap.xml`, `/robots.txt`, `/admin`, and a published `/writeups/{slug}`.
5. Review Supabase Auth rate limits, password policy, email confirmation, and optional MFA. Keep public sign-ups disabled and periodically review the `admins` allowlist.

The Supabase client communicates directly with Supabase's REST and Storage APIs using the public anon key and the authenticated user's session. This intentionally uses Supabase Auth + RLS as the REST authorization layer rather than adding a separate Express server to Vercel; all admin mutations are still rejected by database policies unless the JWT belongs to the allowlisted owner. No service-role credentials are required by the app.

Before launch, replace placeholder identity/contact information, publish only content and write-ups that are safe to disclose, check every credential URL, and review the site's privacy notice for analytics and contact links.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run build
```

More details are available in [docs/architecture.md](./docs/architecture.md) and [backend/README.md](./backend/README.md).
The original product requirements are preserved in [docs/PRD_Portfolio_Cybersecurity_Engineer.md](./docs/PRD_Portfolio_Cybersecurity_Engineer.md).
