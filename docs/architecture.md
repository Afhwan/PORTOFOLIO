# Architecture

## Applications

- `frontend/` is the sole deployable application: a Next.js App Router project containing public routes, the `/admin` content dashboard, shared UI, and data-access utilities.
- `backend/` stores Supabase's PostgreSQL migration. The database, Supabase Auth, and Storage are the backend services; a separate Express server is intentionally not introduced.
- `docs/` holds operating and architecture documentation.

## Request and authorization flow

1. The public Next.js server component reads published content from Supabase using the public anon key.
2. PostgreSQL RLS limits anonymous queries to published rows.
3. An owner signs in from `/admin` with Supabase Auth.
4. The dashboard confirms the authenticated UUID is present in `public.admins`.
5. Admin CRUD and Storage operations use the session JWT; RLS policies verify the allowlist again at the database boundary.

The browser bundle must never receive a Supabase `service_role` key. Admin UI checks are for user experience only; database policies are the security boundary.

## Development commands

Run commands at the repository root. npm workspaces delegate to `frontend/`:

```sh
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

For Vercel deployments, set Root Directory to `frontend` and configure the public Supabase environment variables there.
