# Backend: Supabase

This folder contains the database definition used by the portfolio. The migration creates the content schema, owner-admin allowlist, PostgreSQL RLS policies, indexes, timestamp triggers, and public asset bucket.

## Setup

Apply `supabase/migrations/202610070001_initial_portfolio.sql` once to a new Supabase project. Then create the owner login through Supabase Authentication, disable public sign-ups, and add the resulting Auth user UUID to `public.admins`:

```sql
insert into public.admins (user_id)
values ('YOUR_AUTH_USER_UUID');
```

For deployment steps and environment variables, see the repository [README](../README.md).
