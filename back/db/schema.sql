-- JB.SKYLENS backend schema
-- Exposed via PostgREST. Two domains: contact form submissions, portfolio/gallery items.

create schema if not exists api;

-- ---------------------------------------------------------------------------
-- contact_messages: mirrors the fields in front/app/[locale]/(site)/contact/ContactClient.tsx
-- ---------------------------------------------------------------------------
create table api.contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null,
  phone       text not null,
  email       text not null,
  message     text not null,
  locale      text not null default 'es',
  status      text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at  timestamptz not null default now()
);

comment on table api.contact_messages is 'Submissions from the site contact form.';

-- ---------------------------------------------------------------------------
-- projects: portfolio/gallery items, replaces the static entries under
-- front/translate/{es,en}.json -> portfolio / gallery
-- ---------------------------------------------------------------------------
create table api.projects (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  category     text not null check (category in ('bodas', 'xv', 'eventos', 'inmobiliaria', 'inspeccion', 'tours360', 'produccion')),
  title_es     text not null,
  title_en     text,
  description_es text,
  description_en text,
  cover_url    text not null,
  media_urls   text[] not null default '{}',
  published    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

comment on table api.projects is 'Portfolio/gallery entries shown on the site, replacing static translation content.';

create index projects_category_idx on api.projects (category);
create index projects_published_idx on api.projects (published);

-- ---------------------------------------------------------------------------
-- roles & grants for PostgREST
-- ---------------------------------------------------------------------------
create role web_anon nologin;
create role web_contact nologin;
create role web_admin nologin;
create role authenticator noinherit login password 'CHANGE_ME';

grant web_anon to authenticator;
grant web_contact to authenticator;
grant web_admin to authenticator;

grant usage on schema api to web_anon, web_contact, web_admin;

-- public: read-only on published projects
grant select on api.projects to web_anon;

-- contact form: insert-only, cannot read back other people's messages
grant insert on api.contact_messages to web_contact;
grant usage, select on sequence api.contact_messages_id_seq to web_contact;

-- admin (authenticated staff, via PostgREST JWT role claim): manage projects, read/triage messages
grant select, insert, update, delete on api.projects to web_admin;
grant usage, select on sequence api.projects_id_seq to web_admin;
grant select, update on api.contact_messages to web_admin;

alter table api.contact_messages enable row level security;
alter table api.projects enable row level security;

create policy contact_insert_only on api.contact_messages
  for insert to web_contact
  with check (true);

create policy contact_admin_rw on api.contact_messages
  for all to web_admin
  using (true) with check (true);

create policy projects_public_read on api.projects
  for select to web_anon
  using (published = true);

create policy projects_admin_rw on api.projects
  for all to web_admin
  using (true) with check (true);
