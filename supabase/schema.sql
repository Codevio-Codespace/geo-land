-- ============================================================================
-- Geo&Land — Supabase setup
-- Run this once in your Supabase project:
--   Dashboard → SQL Editor → New query → paste everything → Run
-- It creates the projects table, security policies, the image bucket and
-- seeds the current 10 projects (only when the table is empty).
-- ============================================================================

-- ---------- 1. Projects table ----------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  sort_order  integer not null default 0,
  title       text not null,
  categories  text[] not null default '{}',
  description text not null default '',
  meta        text[] not null default '{}',
  image_url   text not null default '',
  alt         text not null default '',
  badge       text not null default '',
  featured    boolean not null default false,
  published   boolean not null default true
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------- 2. Row Level Security ----------
alter table public.projects enable row level security;

-- Anyone (anonymous visitors) can read published projects
drop policy if exists "Public read published projects" on public.projects;
create policy "Public read published projects"
  on public.projects for select
  to anon
  using (published = true);

-- Signed-in admins can read everything (including drafts)
drop policy if exists "Admins read all projects" on public.projects;
create policy "Admins read all projects"
  on public.projects for select
  to authenticated
  using (true);

-- Signed-in admins can insert / update / delete
drop policy if exists "Admins insert projects" on public.projects;
create policy "Admins insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

drop policy if exists "Admins update projects" on public.projects;
create policy "Admins update projects"
  on public.projects for update
  to authenticated
  using (true);

drop policy if exists "Admins delete projects" on public.projects;
create policy "Admins delete projects"
  on public.projects for delete
  to authenticated
  using (true);

-- ---------- 3. Storage bucket for project images ----------
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Admins upload project images" on storage.objects;
create policy "Admins upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

drop policy if exists "Admins update project images" on storage.objects;
create policy "Admins update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images');

drop policy if exists "Admins delete project images" on storage.objects;
create policy "Admins delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');

-- ---------- 4. Seed the current projects (only when empty) ----------
insert into public.projects
  (title, categories, description, meta, image_url, alt, badge, featured, sort_order, published)
select
  v.title, v.categories, v.description, v.meta, v.image_url, v.alt, v.badge, v.featured, v.sort_order, true
from (values
  (
    'Kosovo Forest Information System (KFIS)',
    ARRAY['software','forestry']::text[],
    'Design, development, installation, delivery and after-sales service of a permanent IT system for forestry in Kosovo, in a project with the Food and Agriculture Organization of the United Nations.',
    ARRAY['FAO','Web-GIS · System']::text[],
    'assets/img/projects/kfis.png',
    'Kosovo Forest Information System interface with forest polygons over terrain',
    'KFIS — System', true, 0
  ),
  (
    'National Farmer and Payment System (SPFN)',
    ARRAY['software','agriculture']::text[],
    'Web-based application for farmer register and grant management of Kosovo, built on open standards — HTML5, JQuery, JQuery UI and jqGrid.',
    ARRAY['Ministry of Agriculture']::text[],
    'assets/img/projects/farmer-payment-system.jpg',
    'Electronic Farmer Register and payment system screens',
    '', false, 1
  ),
  (
    'Kosovo Vineyard Cadastre & Wine Quality Control System (SVV v.1.3)',
    ARRAY['software']::text[],
    'A unique application for vineyards and wines, developed for the maintenance, expansion and enhancement of the vineyards and wine industry in the vineyard region of Kosovo.',
    ARRAY['Ministry of Agriculture']::text[],
    'assets/img/projects/kaveko.jpg',
    'Kosovo Vineyard Cadastre and Wine Quality Control System interface',
    '', false, 2
  ),
  (
    'Expropriation Project for Brezovica Ski Resort',
    ARRAY['cadastral']::text[],
    'In July 2013, Geo&Land was contracted by Deloitte/USAID to implement the land expropriation process across 3,000 ha of the Brezovica Resort.',
    ARRAY['Deloitte / USAID','3,000 ha']::text[],
    'assets/img/projects/brezovica.jpg',
    'Expropriation map and property table for the Brezovica Ski Resort area',
    '', false, 3
  ),
  (
    'Creation of Soil Map',
    ARRAY['agriculture']::text[],
    'Geo&Land is part of a consortium for the creation of the soil map of the Municipality of Rahovec — a project in its initial phase.',
    ARRAY['Municipality of Rahovec','2018']::text[],
    'assets/img/projects/soil-map.png',
    'Soil profile photographs used in the Rahovec soil map',
    '', false, 4
  ),
  (
    'Development of Management Plans for Forestry',
    ARRAY['forestry']::text[],
    'Research on existing forest plots and digitalisation of forest data, developing long-term management plans with the Kosovo Forest Agency.',
    ARRAY['Kosovo Forest Agency']::text[],
    'assets/img/projects/forest-management-plans.jpg',
    'Forest management plan maps and forest inventory data',
    '', false, 5
  ),
  (
    'Cadastre Reconstruction',
    ARRAY['cadastral']::text[],
    'Updating the cadastral database with actual information regarding inventory and property across five cadastral zones.',
    ARRAY['Cadastral zones · 5']::text[],
    'assets/img/projects/cadastre-reconstruction.jpg',
    'Cadastral reconstruction survey over a cadastral zone',
    '', false, 6
  ),
  (
    'Creation of Digital Maps for GIS Advancement',
    ARRAY['cadastral']::text[],
    'Measuring all water meters through GPS technology and creating a digital map for GIS advancement.',
    ARRAY['Municipal utilities']::text[],
    'assets/img/projects/digital-maps.jpg',
    'Digital map of water meters created through GPS measurement',
    '', false, 7
  ),
  (
    'Land Surveying for Urban Planning',
    ARRAY['cadastral']::text[],
    'Implementation of land surveying in urban zones of Prishtina, including data collection for infrastructure and digital mapping.',
    ARRAY['Prishtina','2017']::text[],
    'assets/img/projects/urban-surveying.png',
    'Land surveying for urban planning in Prishtina',
    '', false, 8
  ),
  (
    'Municipal GIS System',
    ARRAY['software']::text[],
    'One of the first municipal GIS systems in Kosovo — a database with geospatial and textual data presented together.',
    ARRAY['Municipality of Peja']::text[],
    'assets/img/projects/municipal-gis.jpg',
    'Municipal GIS System for the Municipality of Peja',
    '', false, 9
  )
) as v(title, categories, description, meta, image_url, alt, badge, featured, sort_order)
where not exists (select 1 from public.projects);

-- ---------- Done ----------
-- Next: Authentication → Users → Add user (email + password) — that is the
-- admin login for admin.html.
