# Architecture

## Applications and data

- `frontend/` is the Next.js App Router application, public site, `/admin` dashboard, and server API.
- Neon PostgreSQL stores portfolio content. `@neondatabase/serverless` connects only from server-side code through `DATABASE_URL`.
- Neon Managed Better Auth provides the owner login and signed, HTTP-only session cookies.
- Neon Object Storage is optional and serves public portfolio assets from a `public_read` bucket.
- `backend/neon/migrations/` contains the PostgreSQL schema applied in Neon.

## Request and authorization flow

1. Public Next.js server components query only rows with `is_published = true`.
2. The browser signs in through the local `/api/auth/*` proxy; the dashboard never receives database or object-storage credentials. Account creation is disabled by default and, when briefly enabled for initial setup, accepts only `ADMIN_EMAIL`.
3. Admin API routes verify the Managed Better Auth session and compare its email with the server-only `ADMIN_EMAIL` allowlist before reading or mutating private content.
4. Write routes enforce same-origin requests and use parameterized SQL. Table and editable-column names are restricted to fixed allowlists.
5. Asset uploads pass through a server route that validates the admin session, MIME type, and 5 MB limit before writing to Object Storage.

The database URL and S3 credentials are privileged server secrets. Never prefix them with `NEXT_PUBLIC_`, expose them in API responses, or commit them.

## Environment and local development

Copy `frontend/.env.example` to `frontend/.env.local` and configure the required server-side variables. `DATABASE_URL` comes from Neon **Connect**; `NEON_AUTH_BASE_URL` comes from the branch's Neon Auth configuration; `NEON_AUTH_COOKIE_SECRET` must be at least 32 characters; `ADMIN_EMAIL` is the one account allowed to manage content. Set `ALLOW_ADMIN_SIGNUP=true` only for initial owner account creation, then disable it.

For uploads, configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, and `PORTFOLIO_ASSETS_BUCKET` from Neon Object Storage. Use a `public_read` bucket only for assets that are intended to be public.

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

For Vercel, set the Root Directory to `frontend`, add environment variables to each relevant environment, restrict Neon Auth's allowed origins to the app domains, and keep public registration disabled after creating the owner account.
