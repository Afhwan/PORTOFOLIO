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

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'certificates', 'competitions', 'projects',
    'experiences', 'articles', 'site_settings'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end
$$;
