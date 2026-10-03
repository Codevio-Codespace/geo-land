import crypto from 'node:crypto';
import sharp, { type Metadata, type Sharp } from 'sharp';
import { SUPABASE_URL } from './supabase/config';
import { supabaseAdmin } from './supabase/admin';
import { mediaUsage } from './content';
import type { MediaRow } from './db-types';

const BUCKET = 'media';
const MAX_FILE = 20 * 1024 * 1024;
const WIDTHS = [1600, 900, 640];
const PAPER = { r: 228, g: 238, b: 240, alpha: 1 as const };
const ALLOWED_EXT = new Set(['jpg', 'jpeg', 'png', 'webp']);

export function nowIso(): string {
  return new Date().toISOString();
}

function extOf(filename: string): string {
  const i = (filename || '').lastIndexOf('.');
  return i === -1 ? '' : filename.slice(i + 1).toLowerCase();
}

export async function saveUpload(
  data: Buffer,
  filename: string,
  alt = ''
): Promise<{ id?: number; error?: string }> {
  if (!data || !data.length) return { error: 'The uploaded file is empty.' };
  if (data.length > MAX_FILE) return { error: 'Image is larger than the 20 MB limit.' };
  if (!ALLOWED_EXT.has(extOf(filename))) return { error: 'Only JPG, PNG or WebP images are allowed.' };

  let image: Sharp;
  let meta: Metadata;
  try {
    image = sharp(data, { failOn: 'error' }).rotate();
    meta = await image.metadata();
    if (!meta.width || !meta.height) throw new Error('no dimensions');
  } catch {
    return { error: 'This file is not a readable image.' };
  }

  const hash8 = crypto.createHash('sha256').update(data).digest('hex').slice(0, 8);
  const stem = `u${hash8}`;
  const keyPrefix = `${hash8}/${stem}`;
  const base = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${keyPrefix}`;

  const supabase = supabaseAdmin();
  const existing = await supabase.from('media').select('*').eq('base', base).maybeSingle();
  if (existing.data) return { id: (existing.data as MediaRow).id };

  const widths = [...new Set(WIDTHS.filter((w) => w <= meta.width!))];
  if (!widths.length) widths.push(meta.width!);
  widths.sort((a, b) => b - a);

  const uploaded: string[] = [];
  let largestWidth = widths[0];
  let largestHeight = meta.height;

  try {
    for (const w of widths) {
      const h = Math.round((meta.height! * w) / meta.width!);
      const resized = await image.clone().resize({ width: w }).toBuffer();
      const webp = await sharp(resized).webp({ quality: 78, effort: 5 }).toBuffer();
      const jpg = await sharp(resized).flatten({ background: PAPER }).jpeg({ quality: 80, mozjpeg: true }).toBuffer();
      const objects = [
        { path: `${keyPrefix}-${w}.webp`, body: webp, type: 'image/webp' },
        { path: `${keyPrefix}-${w}.jpg`, body: jpg, type: 'image/jpeg' },
      ];
      for (const object of objects) {
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(object.path, object.body, { contentType: object.type, upsert: true });
        if (error) throw new Error(error.message);
        uploaded.push(object.path);
      }
      largestWidth = w;
      largestHeight = h;
    }

    const inserted = await supabase
      .from('media')
      .insert({
        base,
        original_name: filename.split(/[\\/]/).pop() || '',
        alt: (alt || '').slice(0, 200),
        width: largestWidth,
        height: largestHeight,
        widths: widths.join(','),
        is_upload: 1,
        created_at: nowIso(),
      })
      .select('id')
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    return { id: inserted.data.id as number };
  } catch (error) {
    if (uploaded.length) {
      await supabase.storage.from(BUCKET).remove(uploaded);
    }
    return { error: `Upload failed: ${(error as Error).message}` };
  }
}

export async function deleteMedia(id: number): Promise<string | null> {
  const supabase = supabaseAdmin();
  const found = await supabase.from('media').select('*').eq('id', id).maybeSingle();
  const row = found.data as MediaRow | null;
  if (!row) return 'Image not found.';
  const refs = await mediaUsage(id);
  if (refs.length) return 'Still used by ' + refs.join(', ') + ' — remove it there first.';
  if (row.is_upload) {
    const publicPart = row.base.split(`/object/public/${BUCKET}/`)[1];
    if (publicPart) {
      const paths: string[] = [];
      for (const w of (row.widths || '').split(',')) {
        if (!w) continue;
        paths.push(`${publicPart}-${w}.webp`, `${publicPart}-${w}.jpg`);
      }
      await supabase.storage.from(BUCKET).remove(paths);
    }
  }
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) return error.message;
  return null;
}
