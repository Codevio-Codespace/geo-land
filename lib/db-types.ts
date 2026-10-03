export const CATS: Record<string, string> = {
  'gis-agri': 'GIS & Agriculture',
  software: 'Software Development',
  cadastre: 'Geodetic & Cadastral Surveying',
  forestry: 'Forestry',
};

export const CAT_KEYS = Object.keys(CATS);

export type Category = keyof typeof CATS;

export interface MediaRow {
  id: number;
  base: string;
  original_name: string;
  alt: string;
  width: number | null;
  height: number | null;
  widths: string;
  is_upload: number;
  created_at: string;
}

export interface ProjectRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  year: number | null;
  org: string;
  description: string;
  image_media_id: number | null;
  featured: number;
  featured_rank: number;
  published: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceRow {
  id: number;
  anchor: string;
  name: string;
  short_scope: string;
  scope_items: string;
  scope_paragraph: string;
  deliverables: string;
  image_media_id: number | null;
  sort: number;
  published: number;
  updated_at: string | null;
}

export interface MilestoneRow {
  id: number;
  year: number;
  text: string;
  sort: number;
  published: number;
  updated_at: string | null;
}

export interface ActivityRow {
  id: number;
  ts: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: number | null;
  summary: string;
}
