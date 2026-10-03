import projectsJson from '../data/projects.json';
import mediaManifestJson from '../data/media-manifest.json';
import servicesJson from '../data/services.json';
import milestonesJson from '../data/milestones.json';
import { slugify } from './slug';
import type { MediaRow, MilestoneRow, ProjectRow, ServiceRow } from './db-types';

interface ManifestEntry {
  base: string;
  alt: string;
  width: number;
  height: number;
  widths: number[];
}

interface SeedProject {
  id: string;
  title: string;
  cat: string;
  year?: number;
  org?: string;
  desc?: string;
  img: string;
}

interface SeedService {
  anchor: string;
  name: string;
  sort: number;
  short_scope: string;
  scope_items: string;
  scope_paragraph: string;
  deliverables: string;
  image: string;
}

const FEATURED: Record<string, number> = {
  brezovica: 1,
  'vineyard-rahovec': 2,
  'kfis-ddi': 3,
  'municipal-gis': 4,
};

const manifest = mediaManifestJson as ManifestEntry[];

export const fallbackMedia: MediaRow[] = manifest.map((m, index) => ({
  id: index + 1,
  base: m.base,
  original_name: m.base.split('/').pop() || '',
  alt: m.alt,
  width: m.width,
  height: m.height,
  widths: m.widths.join(','),
  is_upload: 0,
  created_at: '',
}));

const mediaByBase = new Map(fallbackMedia.map((m) => [m.base, m]));

export const fallbackProjects: ProjectRow[] = (projectsJson as SeedProject[]).map((p, index) => {
  const base = '/' + p.img.replace(/-\d+$/, '').replace(/^\/+/, '');
  const media = mediaByBase.get(base);
  const rank = FEATURED[p.id];
  return {
    id: index + 1,
    slug: slugify(p.title),
    title: p.title,
    category: p.cat,
    year: p.year ?? null,
    org: p.org ?? '',
    description: p.desc ?? '',
    image_media_id: media ? media.id : null,
    featured: rank ? 1 : 0,
    featured_rank: rank ?? 100,
    published: 1,
    created_at: '',
    updated_at: '',
  };
});

export const fallbackServices: ServiceRow[] = (servicesJson as SeedService[]).map((s, index) => {
  const media = mediaByBase.get(s.image);
  return {
    id: index + 1,
    anchor: s.anchor,
    name: s.name,
    short_scope: s.short_scope,
    scope_items: s.scope_items,
    scope_paragraph: s.scope_paragraph,
    deliverables: s.deliverables,
    image_media_id: media ? media.id : null,
    sort: s.sort,
    published: 1,
    updated_at: '',
  };
});

export const fallbackMilestones: MilestoneRow[] = (milestonesJson as { year: number; text: string }[])
  .map((m, index) => ({
    id: index + 1,
    year: m.year,
    text: m.text,
    sort: 100,
    published: 1,
    updated_at: '',
  }))
  .sort((a, b) => b.year - a.year || a.sort - b.sort || a.id - b.id);
