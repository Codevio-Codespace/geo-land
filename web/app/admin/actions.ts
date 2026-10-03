'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { FormState } from '@/components/admin/form-types';
import { CATS } from '@/lib/db-types';
import { createServerSupabase, currentUser } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { hasServiceRole } from '@/lib/supabase/config';
import { logActivity } from '@/lib/content';
import { deleteMedia, nowIso, saveUpload } from '@/lib/media';
import { slugify } from '@/lib/slug';

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function flag(form: FormData, key: string): boolean {
  return text(form, key) !== '' && !['0', 'off', 'false', 'no'].includes(text(form, key).toLowerCase());
}

function clip(form: FormData, key: string, max: number, label: string, errors: string[], required = false): string {
  const value = text(form, key);
  if (required && !value) errors.push(`${label} is required.`);
  else if (value.length > max) errors.push(`${label} is too long (max ${max} characters).`);
  return value;
}

function parseYear(raw: string, errors: string[], required = false): number | null {
  if (!raw) {
    if (required) errors.push('Year is required.');
    return null;
  }
  const value = Number(raw);
  if (!Number.isInteger(value)) {
    errors.push('Year must be a number.');
    return null;
  }
  if (value < 1900 || value > 2100) {
    errors.push('Year must be between 1900 and 2100.');
    return null;
  }
  return value;
}

function parseIntOr(form: FormData, key: string, fallback: number, low = 0, high = 9999): number {
  const raw = text(form, key);
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value)) return fallback;
  return Math.max(low, Math.min(high, value));
}

async function requireUser(): Promise<string> {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  if (!hasServiceRole()) redirect('/admin/login?err=Supabase+service+role+is+not+configured');
  return user.email || user.id;
}

async function uniqueSlug(base: string, excludeId?: number): Promise<string> {
  const supabase = supabaseAdmin();
  let slug = base;
  let n = 2;
  for (;;) {
    const { data } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle();
    if (!data || (excludeId && data.id === excludeId)) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

/* ----------------------------- auth ----------------------------- */
export async function loginAction(formData: FormData) {
  const supabase = await createServerSupabase();
  if (!supabase) redirect('/admin/login?err=Supabase+is+not+configured');
  const email = text(formData, 'email');
  const password = String(formData.get('password') || '');
  let failure = '';
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      failure =
        error.name === 'AuthRetryableFetchError' || error.status === 0
          ? 'Could not reach Supabase — check the URL and keys.'
          : 'Invalid email or password.';
    }
  } catch {
    failure = 'Could not reach Supabase — check the URL and keys.';
  }
  if (failure) redirect('/admin/login?err=' + encodeURIComponent(failure));
  redirect('/admin');
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect('/admin/login');
}

/* --------------------------- projects --------------------------- */

async function processUploads(form: FormData, actor: string): Promise<{ id?: number; error?: string; extra: number[] }> {
  const extra: number[] = [];
  let mainId: number | undefined;

  const main = form.get('image_upload');
  if (main instanceof File && main.size > 0) {
    const buffer = Buffer.from(await main.arrayBuffer());
    const result = await saveUpload(buffer, main.name, text(form, 'image_alt'));
    if (result.error) return { error: result.error, extra };
    mainId = result.id;
    await logActivity(actor, 'upload', 'media', mainId ?? null, `Uploaded ${main.name}`);
  }

  const gallery = form.getAll('images_upload').filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of gallery) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await saveUpload(buffer, file.name);
    if (result.error) return { error: `${file.name}: ${result.error}`, extra };
    if (result.id) {
      extra.push(result.id);
      await logActivity(actor, 'upload', 'media', result.id, `Uploaded ${file.name}`);
    }
  }
  return { id: mainId, extra };
}

export async function saveProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireUser();
  const idRaw = text(formData, 'id');
  const projectId = /^\d+$/.test(idRaw) ? Number(idRaw) : undefined;
  const values: Record<string, string> = {};
  for (const key of ['title', 'slug', 'category', 'year', 'org', 'description', 'featured_rank']) {
    values[key] = text(formData, key);
  }
  values.featured = flag(formData, 'featured') ? '1' : '';
  values.published = flag(formData, 'published') ? '1' : '';
  values.image_media_id = text(formData, 'image_media_id');
  values.additional_images = formData
    .getAll('additional_images')
    .filter((v): v is string => typeof v === 'string')
    .join(',');

  const uploads = await processUploads(formData, actor);
  if (uploads.error) return { errors: [uploads.error], values };
  if (uploads.id) values.image_media_id = String(uploads.id);
  const picks = values.additional_images ? values.additional_images.split(',').filter(Boolean) : [];
  for (const extraId of uploads.extra) picks.push(String(extraId));
  values.additional_images = [...new Set(picks)].join(',');

  const errors: string[] = [];
  const title = clip(formData, 'title', 200, 'Title', errors, true);
  if (title && title.length < 3) errors.push('Title must be at least 3 characters.');
  const category = text(formData, 'category');
  if (!(category in CATS)) errors.push('Category is not valid.');
  const year = parseYear(text(formData, 'year'), errors);
  const org = clip(formData, 'org', 120, 'Organization', errors);
  const description = clip(formData, 'description', 4000, 'Description', errors);

  let imageId: number | null = /^\d+$/.test(values.image_media_id) ? Number(values.image_media_id) : null;
  if (imageId) {
    const check = await supabaseAdmin().from('media').select('id').eq('id', imageId).maybeSingle();
    if (!check.data) {
      errors.push('Selected main image no longer exists.');
      imageId = null;
    }
  }
  if (!imageId) errors.push('A main image is required.');
  if (errors.length) return { errors, values };

  const slugInput = text(formData, 'slug').toLowerCase();
  let slug: string;
  if (projectId) {
    const existing = await supabaseAdmin().from('projects').select('*').eq('id', projectId).maybeSingle();
    if (!existing.data) return { errors: ['Project not found.'], values };
    if (slugInput && slugInput !== existing.data.slug) {
      slug = await uniqueSlug(slugify(slugInput), projectId);
    } else {
      slug = existing.data.slug;
    }
  } else {
    slug = await uniqueSlug(slugify(slugInput || title));
  }

  const extraIds = values.additional_images
    .split(',')
    .filter((v) => /^\d+$/.test(v))
    .map(Number);
  let okIds: number[] = [];
  if (extraIds.length) {
    const { data: mediaRows } = await supabaseAdmin().from('media').select('id').in('id', extraIds);
    okIds = (mediaRows || []).map((r) => r.id as number);
  }
  okIds = [...new Set(okIds)];

  const featured = flag(formData, 'featured') ? 1 : 0;
  const rank = parseIntOr(formData, 'featured_rank', 100, 0, 9999);
  const published = flag(formData, 'published') ? 1 : 0;
  const now = nowIso();
  const supabase = supabaseAdmin();

  let pid = projectId;
  if (projectId) {
    const { error } = await supabase
      .from('projects')
      .update({
        slug,
        title,
        category,
        year,
        org,
        description,
        image_media_id: imageId,
        featured,
        featured_rank: rank,
        published,
        updated_at: now,
      })
      .eq('id', projectId);
    if (error) return { errors: [error.message], values };
  } else {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        slug,
        title,
        category,
        year,
        org,
        description,
        image_media_id: imageId,
        featured,
        featured_rank: rank,
        published,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single();
    if (error) return { errors: [error.message], values };
    pid = data.id as number;
  }

  await supabase.from('project_images').delete().eq('project_id', pid);
  if (okIds.length) {
    await supabase
      .from('project_images')
      .insert(okIds.map((mediaId, index) => ({ project_id: pid, media_id: mediaId, sort: index * 10 })));
  }

  await logActivity(
    actor,
    projectId ? 'update' : 'create',
    'project',
    pid ?? null,
    `${projectId ? 'Updated' : 'Created'} ${published ? 'published' : 'draft'} project “${title}”`
  );
  revalidatePath('/', 'layout');
  redirect(`/admin/projects?ok=${encodeURIComponent(`${projectId ? 'Updated' : 'Saved'} “${title}”${published ? '' : ' as draft'}`)}`);
}

export async function projectAction(formData: FormData) {
  const actor = await requireUser();
  const idRaw = text(formData, 'id');
  const action = text(formData, 'do');
  if (!/^\d+$/.test(idRaw)) redirect('/admin/projects?err=Project+not+found');
  const id = Number(idRaw);
  const supabase = supabaseAdmin();
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  if (!project) redirect('/admin/projects?err=Project+not+found');
  let error: string | null = null;
  if (action === 'publish') {
    if (!project.image_media_id) error = 'Add a main image before publishing.';
    else {
      await supabase.from('projects').update({ published: 1, updated_at: nowIso() }).eq('id', id);
      await logActivity(actor, 'publish', 'project', id, `Published “${project.title}”`);
    }
  } else if (action === 'unpublish') {
    await supabase.from('projects').update({ published: 0, updated_at: nowIso() }).eq('id', id);
    await logActivity(actor, 'unpublish', 'project', id, `Unpublished “${project.title}”`);
  } else if (action === 'delete') {
    const refs = await supabase.from('project_images').select('media_id').eq('project_id', id);
    if (!refs.error) {
      await supabase.from('project_images').delete().eq('project_id', id);
    }
    await supabase.from('projects').delete().eq('id', id);
    await logActivity(actor, 'delete', 'project', id, `Deleted “${project.title}”`);
  } else {
    error = 'Unknown action.';
  }
  revalidatePath('/', 'layout');
  if (error) redirect('/admin/projects?err=' + encodeURIComponent(error));
  redirect('/admin/projects?ok=Done');
}

/* --------------------------- services --------------------------- */

export async function saveServiceAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireUser();
  const idRaw = text(formData, 'id');
  const serviceId = /^\d+$/.test(idRaw) ? Number(idRaw) : undefined;
  const values: Record<string, string> = {};
  for (const key of ['name', 'anchor', 'short_scope', 'scope_items', 'scope_paragraph', 'deliverables', 'sort']) {
    values[key] = text(formData, key);
  }
  values.image_media_id = text(formData, 'image_media_id');
  values.published = flag(formData, 'published') ? '1' : '';

  const upload = formData.get('image_upload');
  if (upload instanceof File && upload.size > 0) {
    const result = await saveUpload(Buffer.from(await upload.arrayBuffer()), upload.name);
    if (result.error) return { errors: [result.error], values };
    values.image_media_id = String(result.id);
    await logActivity(actor, 'upload', 'media', result.id ?? null, `Uploaded ${upload.name}`);
  }

  const errors: string[] = [];
  const name = clip(formData, 'name', 120, 'Name', errors, true);
  const anchor = slugify(text(formData, 'anchor') || name || '');
  if (!anchor) errors.push('Anchor is required.');
  const shortScope = clip(formData, 'short_scope', 200, 'Short scope', errors);
  const scopeParagraph = clip(formData, 'scope_paragraph', 1200, 'Intro paragraph', errors);
  const deliverables = clip(formData, 'deliverables', 300, 'Deliverables', errors);
  const items = text(formData, 'scope_items')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (items.length > 12) errors.push('Scope allows at most 12 items.');
  if (items.some((item) => item.length > 200)) errors.push('Each scope item must be under 200 characters.');

  let imageId: number | null = /^\d+$/.test(values.image_media_id) ? Number(values.image_media_id) : null;
  if (imageId) {
    const check = await supabaseAdmin().from('media').select('id').eq('id', imageId).maybeSingle();
    if (!check.data) {
      errors.push('Selected image no longer exists.');
      imageId = null;
    }
  }

  const supabase = supabaseAdmin();
  const existing = await supabase.from('services').select('id').eq('anchor', anchor).maybeSingle();
  if (existing.data && (!serviceId || existing.data.id !== serviceId)) {
    errors.push('Another service already uses that anchor.');
  }
  if (errors.length) return { errors, values };

  const sort = parseIntOr(formData, 'sort', 100, 1, 999);
  const published = flag(formData, 'published') ? 1 : 0;
  const record = {
    anchor,
    name,
    short_scope: shortScope,
    scope_items: items.join('\n'),
    scope_paragraph: scopeParagraph,
    deliverables,
    image_media_id: imageId,
    sort,
    published,
    updated_at: nowIso(),
  };

  let sid = serviceId;
  if (serviceId) {
    const { error } = await supabase.from('services').update(record).eq('id', serviceId);
    if (error) return { errors: [error.message], values };
  } else {
    const { data, error } = await supabase.from('services').insert(record).select('id').single();
    if (error) return { errors: [error.message], values };
    sid = data.id as number;
  }
  await logActivity(actor, serviceId ? 'update' : 'create', 'service', sid ?? null, `${serviceId ? 'Updated' : 'Created'} service “${name}”`);
  revalidatePath('/', 'layout');
  redirect(`/admin/services?ok=${encodeURIComponent(`Saved “${name}”`)}`);
}

/* -------------------------- milestones -------------------------- */

export async function saveMilestoneAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireUser();
  const idRaw = text(formData, 'id');
  const milestoneId = /^\d+$/.test(idRaw) ? Number(idRaw) : undefined;
  const values: Record<string, string> = {
    text: text(formData, 'text'),
    year: text(formData, 'year'),
    sort: text(formData, 'sort'),
    published: flag(formData, 'published') ? '1' : '',
  };

  const errors: string[] = [];
  const entry = clip(formData, 'text', 500, 'Text', errors, true);
  const year = parseYear(values.year, errors, true);
  if (errors.length) return { errors, values };

  const sort = parseIntOr(formData, 'sort', 100, 1, 999);
  const published = flag(formData, 'published') ? 1 : 0;
  const supabase = supabaseAdmin();
  const record = { year, text: entry, sort, published, updated_at: nowIso() };

  const { error } = milestoneId
    ? await supabase.from('milestones').update(record).eq('id', milestoneId)
    : await supabase.from('milestones').insert(record);
  if (error) return { errors: [error.message], values };

  await logActivity(actor, milestoneId ? 'update' : 'create', 'milestone', milestoneId ?? null, `${milestoneId ? 'Updated' : 'Added'} milestone ${year}`);
  revalidatePath('/', 'layout');
  redirect('/admin/milestones?ok=Saved');
}

export async function milestoneAction(formData: FormData) {
  const actor = await requireUser();
  const idRaw = text(formData, 'id');
  const doWhat = text(formData, 'do');
  if (!/^\d+$/.test(idRaw)) redirect('/admin/milestones?err=Milestone+not+found');
  const id = Number(idRaw);
  const supabase = supabaseAdmin();
  const { data: milestone } = await supabase.from('milestones').select('*').eq('id', id).maybeSingle();
  if (!milestone) redirect('/admin/milestones?err=Milestone+not+found');
  if (doWhat === 'delete') {
    await supabase.from('milestones').delete().eq('id', id);
    await logActivity(actor, 'delete', 'milestone', id, `Deleted milestone ${milestone.year}`);
  } else {
    await supabase
      .from('milestones')
      .update({ published: doWhat === 'publish' ? 1 : 0, updated_at: nowIso() })
      .eq('id', id);
    await logActivity(actor, doWhat === 'publish' ? 'publish' : 'unpublish', 'milestone', id, `${doWhat === 'publish' ? 'Showed' : 'Hid'} milestone ${milestone.year}`);
  }
  revalidatePath('/', 'layout');
  redirect('/admin/milestones?ok=Done');
}

/* ----------------------------- media ----------------------------- */

export async function uploadMediaAction(formData: FormData) {
  const actor = await requireUser();
  const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) redirect('/admin/media?err=' + encodeURIComponent('Choose at least one image'));
  const alt = text(formData, 'alt');
  const errors: string[] = [];
  let uploaded = 0;
  for (const file of files) {
    const result = await saveUpload(Buffer.from(await file.arrayBuffer()), file.name, alt);
    if (result.error) errors.push(`${file.name}: ${result.error}`);
    else {
      uploaded += 1;
      await logActivity(actor, 'upload', 'media', result.id ?? null, `Uploaded ${file.name}`);
    }
  }
  if (errors.length) redirect('/admin/media?err=' + encodeURIComponent(errors.join('; ')));
  redirect('/admin/media?ok=' + encodeURIComponent(`Uploaded ${uploaded} image(s)`));
}

export async function saveMediaAltAction(formData: FormData) {
  const actor = await requireUser();
  const idRaw = text(formData, 'id');
  if (!/^\d+$/.test(idRaw)) redirect('/admin/media?err=Image+not+found');
  const id = Number(idRaw);
  const supabase = supabaseAdmin();
  const { data: media } = await supabase.from('media').select('*').eq('id', id).maybeSingle();
  if (!media) redirect('/admin/media?err=Image+not+found');
  const alt = text(formData, 'alt').slice(0, 200);
  await supabase.from('media').update({ alt }).eq('id', id);
  await logActivity(actor, 'update', 'media', id, `Updated alt text for ${String(media.base).split('/').pop()}`);
  revalidatePath('/admin/media');
  redirect('/admin/media?ok=Saved');
}

export async function deleteEntityAction(formData: FormData) {
  const actor = await requireUser();
  const entity = text(formData, 'action');
  const idRaw = text(formData, 'id');
  if (!/^\d+$/.test(idRaw)) redirect('/admin/projects?err=' + encodeURIComponent('Item not found'));
  const id = Number(idRaw);
  const supabase = supabaseAdmin();

  if (entity === 'delete_project') {
    const { data: project } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
    if (project) {
      await supabase.from('project_images').delete().eq('project_id', id);
      await supabase.from('projects').delete().eq('id', id);
      await logActivity(actor, 'delete', 'project', id, `Deleted “${project.title}”`);
    }
    revalidatePath('/', 'layout');
    redirect('/admin/projects?ok=Done');
  }
  if (entity === 'delete_milestone') {
    const { data: milestone } = await supabase.from('milestones').select('*').eq('id', id).maybeSingle();
    if (milestone) {
      await supabase.from('milestones').delete().eq('id', id);
      await logActivity(actor, 'delete', 'milestone', id, `Deleted milestone ${milestone.year}`);
    }
    revalidatePath('/', 'layout');
    redirect('/admin/milestones?ok=Done');
  }
  if (entity === 'delete_media') {
    const error = await deleteMedia(id);
    if (!error) await logActivity(actor, 'delete', 'media', id, 'Deleted image');
    revalidatePath('/admin/media');
    redirect(error ? '/admin/media?err=' + encodeURIComponent(error) : '/admin/media?ok=Done');
  }
  redirect('/admin/projects?err=' + encodeURIComponent('Item not found'));
}
