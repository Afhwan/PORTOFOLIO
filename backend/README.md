# Backend: Neon

The application uses Neon PostgreSQL for portfolio content and Neon Managed Better Auth for the single dashboard owner. `backend/neon/migrations/202610080001_initial_portfolio.sql` creates the content tables, constraints, indexes, and `updated_at` triggers.

The follow-up migration `backend/neon/migrations/202610090001_content_media_and_types.sql` adds image galleries for certificates, competitions, projects, experiences, and articles; adds PDF certificate links and experience types; and expands project categories to websites, games, security, research, and other. Run the initial migration first, then run this follow-up migration in the same Neon branch before using the new CMS fields. It remaps existing `appsec` and `blue` project categories to `security`; it does not delete existing content. These migrations are not run automatically by the app.

## First-time setup

1. Create a Neon project in an AWS region. Singapore is supported by Managed Auth and Object Storage.
2. In the project's branch, open **Auth** and enable Managed Better Auth. Configure email/password sign-in and allowed origins for local development and production.
3. In **Connect**, select the branch, database, and role, then copy the pooled connection string into the server-only `DATABASE_URL` variable.
4. Set `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET` (generate with `openssl rand -base64 32`), and the matching owner `ADMIN_EMAIL`.
5. Paste the SQL migration into the Neon SQL Editor and click **Run**, not **Explain**. `EXPLAIN` does not execute DDL statements such as `CREATE TABLE`. This migration uses PostgreSQL's built-in `gen_random_uuid()` and requires no extension. It is safe to run again: the tables, indexes, and update triggers are created idempotently.
6. Optionally create an Object Storage bucket called `portfolio-assets` with `public_read` access and create a storage credential with read/write scope. Add the returned S3 values to the server-only `AWS_*` variables. Only upload files intended for public viewing.
7. In Neon Auth Configuration, temporarily enable email/password sign-up. Run `npm run dev` at the repository root, set `ALLOW_ADMIN_SIGNUP=true`, and visit `/admin`. Registration is limited to `ADMIN_EMAIL`; after creating the owner account, disable sign-up in Neon Auth, set `ALLOW_ADMIN_SIGNUP=false`, and restart the app.

## Access-control boundary

The browser does not connect to PostgreSQL. Public reads are executed by server components with explicit published-row filters. Admin reads and writes go through `/api/admin/*`, which checks the Neon Auth session and exact email allowlist before issuing SQL. The database/API environment must not be shared with untrusted server code.

For Neon product setup, consult the official [Managed Auth Next.js quickstart](https://neon.com/docs/auth/quick-start/nextjs-api-only), [Next.js server SDK reference](https://neon.com/docs/auth/reference/nextjs-server), and [Object Storage quickstart](https://neon.com/docs/storage/get-started).
