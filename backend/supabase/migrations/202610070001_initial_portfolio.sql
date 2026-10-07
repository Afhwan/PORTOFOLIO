create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  name_id text not null default 'Nama Anda',
  name_en text not null default 'Your Name',
  title_id text not null default 'Junior Cybersecurity Engineer',
  title_en text not null default 'Junior Cybersecurity Engineer',
  bio_id text not null default '',
  bio_en text not null default '',
  photo_url text,
  email text,
  linkedin text,
  github text,
  cv_url text,
  is_published boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text not null,
  issue_date date,
  expiry_date date,
  credential_url text,
  image_url text,
  category text not null default 'General',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certificate_dates_valid check (expiry_date is null or issue_date is null or expiry_date >= issue_date)
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organizer text not null default '',
  date date,
  achievement text not null default '',
  ctf_writeup_url text,
  description_id text not null default '',
  description_en text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title_id text not null,
  title_en text not null,
  slug text not null unique,
  description_id text not null default '',
  description_en text not null default '',
  tech_stack text[] not null default '{}',
  repo_url text,
  demo_url text,
  image_url text,
  category text not null default 'appsec' check (category in ('appsec', 'blue', 'research', 'other')),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_slug_valid check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role_id text not null,
  role_en text not null,
  company text not null default '',
  start_date date,
  end_date date,
  description_id text not null default '',
  description_en text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experience_dates_valid check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title_id text not null,
  title_en text not null,
  slug text not null unique,
  excerpt_id text not null default '',
  excerpt_en text not null default '',
  body_markdown text not null default '',
  tags text[] not null default '{}',
  published_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint article_slug_valid check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists certificates_public_date_idx on public.certificates (issue_date desc) where is_published;
create index if not exists competitions_public_date_idx on public.competitions (date desc) where is_published;
create index if not exists projects_public_featured_idx on public.projects (is_featured desc, created_at desc) where is_published;
create index if not exists experiences_public_date_idx on public.experiences (start_date desc) where is_published;
create index if not exists articles_public_date_idx on public.articles (published_at desc) where is_published;
create unique index if not exists profiles_single_row_idx on public.profiles ((true));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
drop trigger if exists certificates_set_updated_at on public.certificates;
create trigger certificates_set_updated_at before update on public.certificates
for each row execute function public.set_updated_at();
drop trigger if exists competitions_set_updated_at on public.competitions;
create trigger competitions_set_updated_at before update on public.competitions
for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
drop trigger if exists experiences_set_updated_at on public.experiences;
create trigger experiences_set_updated_at before update on public.experiences
for each row execute function public.set_updated_at();
drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at before update on public.articles
for each row execute function public.set_updated_at();
drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.admins enable row level security;
alter table public.profiles enable row level security;
alter table public.certificates enable row level security;
alter table public.competitions enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.articles enable row level security;
alter table public.site_settings enable row level security;

create policy "Admins can read own admin record" on public.admins
for select to authenticated using (user_id = (select auth.uid()));

create policy "Public reads published profiles" on public.profiles
for select to anon using (is_published);
create policy "Authenticated reads profiles" on public.profiles
for select to authenticated using (is_published or (select public.is_portfolio_admin()));
create policy "Admins manage profiles" on public.profiles
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create policy "Public reads published certificates" on public.certificates
for select to anon using (is_published);
create policy "Authenticated reads certificates" on public.certificates
for select to authenticated using (is_published or (select public.is_portfolio_admin()));
create policy "Admins manage certificates" on public.certificates
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create policy "Public reads published competitions" on public.competitions
for select to anon using (is_published);
create policy "Authenticated reads competitions" on public.competitions
for select to authenticated using (is_published or (select public.is_portfolio_admin()));
create policy "Admins manage competitions" on public.competitions
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create policy "Public reads published projects" on public.projects
for select to anon using (is_published);
create policy "Authenticated reads projects" on public.projects
for select to authenticated using (is_published or (select public.is_portfolio_admin()));
create policy "Admins manage projects" on public.projects
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create policy "Public reads published experiences" on public.experiences
for select to anon using (is_published);
create policy "Authenticated reads experiences" on public.experiences
for select to authenticated using (is_published or (select public.is_portfolio_admin()));
create policy "Admins manage experiences" on public.experiences
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create policy "Public reads published articles" on public.articles
for select to anon using (is_published);
create policy "Authenticated reads articles" on public.articles
for select to authenticated using (is_published or (select public.is_portfolio_admin()));
create policy "Admins manage articles" on public.articles
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

create policy "Public reads public settings" on public.site_settings
for select to anon using (is_public);
create policy "Authenticated reads settings" on public.site_settings
for select to authenticated using (is_public or (select public.is_portfolio_admin()));
create policy "Admins manage settings" on public.site_settings
for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-assets',
  'portfolio-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads portfolio assets" on storage.objects
for select to anon, authenticated using (bucket_id = 'portfolio-assets');
create policy "Admins upload portfolio assets" on storage.objects
for insert to authenticated with check (
  bucket_id = 'portfolio-assets' and (select public.is_portfolio_admin())
);
create policy "Admins update portfolio assets" on storage.objects
for update to authenticated using (
  bucket_id = 'portfolio-assets' and (select public.is_portfolio_admin())
) with check (
  bucket_id = 'portfolio-assets' and (select public.is_portfolio_admin())
);
create policy "Admins delete portfolio assets" on storage.objects
for delete to authenticated using (
  bucket_id = 'portfolio-assets' and (select public.is_portfolio_admin())
);

grant select on public.profiles, public.certificates, public.competitions,
  public.projects, public.experiences, public.articles, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.certificates,
  public.competitions, public.projects, public.experiences, public.articles, public.site_settings to authenticated;
grant select on public.admins to authenticated;
