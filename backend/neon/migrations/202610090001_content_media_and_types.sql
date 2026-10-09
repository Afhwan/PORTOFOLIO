alter table public.certificates
  add column if not exists document_url text,
  add column if not exists media_urls text[] not null default '{}';

alter table public.competitions
  add column if not exists media_urls text[] not null default '{}';

alter table public.projects
  add column if not exists media_urls text[] not null default '{}';

alter table public.experiences
  add column if not exists experience_type text not null default 'work',
  add column if not exists media_urls text[] not null default '{}';

alter table public.articles
  add column if not exists media_urls text[] not null default '{}';

alter table public.projects
  drop constraint if exists projects_category_check;

update public.projects
set category = case
  when category in ('appsec', 'blue') then 'security'
  when category in ('research', 'other', 'website', 'game', 'security') then category
  else 'other'
end;

alter table public.projects
  add constraint projects_category_check
  check (category in ('website', 'game', 'security', 'research', 'other'));

alter table public.projects
  alter column category set default 'security';

alter table public.experiences
  drop constraint if exists experiences_experience_type_check;

alter table public.experiences
  add constraint experiences_experience_type_check
  check (experience_type in ('work', 'education', 'seminar', 'conference', 'workshop', 'volunteering', 'other'));
