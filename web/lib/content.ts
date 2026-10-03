import { fallbackMedia, fallbackMilestones, fallbackProjects, fallbackServices } from './fallback';
import { supabasePublic } from './supabase/public';
import { supabaseAdmin } from './supabase/admin';
import { hasServiceRole } from './supabase/config';
import type { ActivityRow, MediaRow, MilestoneRow, ProjectRow, ServiceRow } from './db-types';

function logFallback(scope: string, error: unknown) {
  console.error(`[cms] ${scope} failed, serving fallback content:`, error);
}

export async function getPublicProjects(): Promise<ProjectRow[]> {
  const supabase = supabasePublic();
  if (!supabase) {
    return [...fallbackProjects].sort(
      (a, b) => (b.year || 0) - (a.year || 0) || (a.title < b.title ? -1 : a.title > b.title ? 1 : 0)
    );
  }
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', 1)
    .order('year', { ascending: false })
    .order('title', { ascending: true });
  if (error) {
    logFallback('public projects', error);
    return fallbackProjects;
  }
  return (data as ProjectRow[]) || [];
}

export async function getPublicProjectBySlug(slug: string): Promise<ProjectRow | null> {
  const supabase = supabasePublic();
  if (!supabase) return fallbackProjects.find((p) => p.slug === slug) || null;
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('published', 1)
    .maybeSingle();
  if (error) {
    logFallback('public project', error);
    return fallbackProjects.find((p) => p.slug === slug) || null;
  }
  return (data as ProjectRow) || null;
}

export async function getFeaturedProjects(): Promise<ProjectRow[]> {
  const supabase = supabasePublic();
  if (!supabase) {
    return fallbackProjects
      .filter((p) => p.published && p.featured)
      .sort((a, b) => a.featured_rank - b.featured_rank || (b.year || 0) - (a.year || 0))
      .slice(0, 4);
  }
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('published', 1)
    .eq('featured', 1)
    .order('featured_rank', { ascending: true })
    .order('year', { ascending: false })
    .limit(4);
  if (error) {
    logFallback('featured projects', error);
    return fallbackProjects.filter((p) => p.published && p.featured).slice(0, 4);
  }
  return (data as ProjectRow[]) || [];
}

export async function getProjectImages(projectId: number): Promise<MediaRow[]> {
  const supabase = supabasePublic();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('project_images')
    .select('sort, media:media_id (*)')
    .eq('project_id', projectId)
    .order('sort', { ascending: true });
  if (error) {
    logFallback('project images', error);
    return [];
  }
  return ((data as unknown as { media: MediaRow | null }[]) || [])
    .map((row) => row.media)
    .filter((m): m is MediaRow => Boolean(m));
}

export async function getPublicServices(): Promise<ServiceRow[]> {
  const supabase = supabasePublic();
  if (!supabase) return fallbackServices;
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('published', 1)
    .order('sort', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    logFallback('public services', error);
    return fallbackServices;
  }
  return (data as ServiceRow[]) || [];
}

export async function getPublicMilestones(): Promise<MilestoneRow[]> {
  const supabase = supabasePublic();
  if (!supabase) return fallbackMilestones;
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('published', 1)
    .order('year', { ascending: false })
    .order('sort', { ascending: true })
    .order('id', { ascending: true });
  if (error) {
    logFallback('public milestones', error);
    return fallbackMilestones;
  }
  return (data as MilestoneRow[]) || [];
}

export async function getMediaByIds(ids: number[]): Promise<Map<number, MediaRow>> {
  const unique = [...new Set(ids.filter((id) => Number.isFinite(id)))];
  const map = new Map<number, MediaRow>();
  if (!unique.length) return map;
  const supabase = supabasePublic();
  if (!supabase) {
    for (const m of fallbackMedia) if (unique.includes(m.id)) map.set(m.id, m);
    return map;
  }
  const { data, error } = await supabase.from('media').select('*').in('id', unique);
  if (error) {
    logFallback('media lookup', error);
    for (const m of fallbackMedia) if (unique.includes(m.id)) map.set(m.id, m);
    return map;
  }
  for (const m of (data as MediaRow[]) || []) map.set(m.id, m);
  return map;
}

export async function getMediaById(id: number | null | undefined): Promise<MediaRow | null> {
  if (!id) return null;
  const map = await getMediaByIds([id]);
  return map.get(id) || null;
}

/* ------------------------------------------------------------------ */
/* Admin queries (service role; falls back to fallback data when the   */
/* database is not configured so the panel still reports its state).   */
/* ------------------------------------------------------------------ */

export async function adminProjects(status?: string): Promise<ProjectRow[]> {
  if (!hasServiceRole()) return adminFallbackProjects(status);
  const supabase = supabaseAdmin();
  let query = supabase.from('projects').select('*').order('updated_at', { ascending: false });
  if (status === 'published') query = query.eq('published', 1);
  if (status === 'draft') query = query.eq('published', 0);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as ProjectRow[]) || [];
}

function adminFallbackProjects(status?: string): ProjectRow[] {
  return fallbackProjects.filter(
    (p) => !status || (status === 'published' ? p.published : !p.published)
  );
}

export async function projectById(id: number): Promise<ProjectRow | null> {
  if (!hasServiceRole()) return fallbackProjects.find((p) => p.id === id) || null;
  const { data, error } = await supabaseAdmin().from('projects').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ProjectRow) || null;
}

export async function projectImageIds(projectId: number): Promise<number[]> {
  if (!hasServiceRole()) return [];
  const { data, error } = await supabaseAdmin()
    .from('project_images')
    .select('media_id')
    .eq('project_id', projectId);
  if (error) throw new Error(error.message);
  return ((data as { media_id: number }[]) || []).map((r) => r.media_id);
}

export async function allServices(): Promise<ServiceRow[]> {
  if (!hasServiceRole()) return fallbackServices;
  const { data, error } = await supabaseAdmin()
    .from('services')
    .select('*')
    .order('sort', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as ServiceRow[]) || [];
}

export async function serviceById(id: number): Promise<ServiceRow | null> {
  if (!hasServiceRole()) return fallbackServices.find((s) => s.id === id) || null;
  const { data, error } = await supabaseAdmin().from('services').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as ServiceRow) || null;
}

export async function allMilestones(): Promise<MilestoneRow[]> {
  if (!hasServiceRole()) return fallbackMilestones;
  const { data, error } = await supabaseAdmin()
    .from('milestones')
    .select('*')
    .order('year', { ascending: false })
    .order('sort', { ascending: true })
    .order('id', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as MilestoneRow[]) || [];
}

export async function milestoneById(id: number): Promise<MilestoneRow | null> {
  if (!hasServiceRole()) return fallbackMilestones.find((m) => m.id === id) || null;
  const { data, error } = await supabaseAdmin().from('milestones').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as MilestoneRow) || null;
}

export async function allMedia(): Promise<MediaRow[]> {
  if (!hasServiceRole()) return fallbackMedia;
  const { data, error } = await supabaseAdmin()
    .from('media')
    .select('*')
    .order('id', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as MediaRow[]) || [];
}

export async function mediaUsage(mediaId: number): Promise<string[]> {
  if (!hasServiceRole()) {
    const refs: string[] = [];
    for (const p of fallbackProjects) {
      if (p.image_media_id === mediaId) refs.push(`project “${p.title}”`);
    }
    for (const s of fallbackServices) {
      if (s.image_media_id === mediaId) refs.push(`service “${s.name}”`);
    }
    return refs;
  }
  const supabase = supabaseAdmin();
  const refs: string[] = [];
  const { data: projectRows } = await supabase
    .from('projects')
    .select('title')
    .eq('image_media_id', mediaId);
  for (const row of (projectRows as { title: string }[]) || []) refs.push(`project “${row.title}”`);
  const { data: galleryRows } = await supabase
    .from('project_images')
    .select('projects ( title )')
    .eq('media_id', mediaId);
  for (const row of (galleryRows as unknown as { projects: { title: string } | null }[]) || []) {
    if (row.projects) refs.push(`project “${row.projects.title}”`);
  }
  const { data: serviceRows } = await supabase.from('services').select('name').eq('image_media_id', mediaId);
  for (const row of (serviceRows as { name: string }[]) || []) refs.push(`service “${row.name}”`);
  return refs;
}

export async function recentActivity(limit = 10): Promise<ActivityRow[]> {
  if (!hasServiceRole()) return [];
  const { data, error } = await supabaseAdmin()
    .from('activity')
    .select('*')
    .order('id', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data as ActivityRow[]) || [];
}

export async function dashboardCounts() {
  if (!hasServiceRole()) {
    return {
      projects: fallbackProjects.length,
      published: fallbackProjects.filter((p) => p.published).length,
      drafts: fallbackProjects.filter((p) => !p.published).length,
      services: fallbackServices.length,
      milestones: fallbackMilestones.length,
      media: fallbackMedia.length,
    };
  }
  const supabase = supabaseAdmin();
  const count = async (table: string, filter?: [string, number]) => {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) query = query.eq(filter[0], filter[1]);
    const { count: total, error } = await query;
    if (error) throw new Error(error.message);
    return total || 0;
  };
  const [projects, published, services, milestones, media] = await Promise.all([
    count('projects'),
    count('projects', ['published', 1]),
    count('services'),
    count('milestones'),
    count('media'),
  ]);
  return { projects, published, drafts: projects - published, services, milestones, media };
}

export async function logActivity(
  actor: string,
  action: string,
  entity: string,
  entityId: number | null,
  summary: string
): Promise<void> {
  if (!hasServiceRole()) return;
  const { error } = await supabaseAdmin().from('activity').insert({
    actor,
    action,
    entity,
    entity_id: entityId,
    summary,
  });
  if (error) console.error('[cms] activity log failed:', error.message);
}
