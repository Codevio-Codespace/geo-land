import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createClient } from '@supabase/supabase-js';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function loadEnv() {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
      }
    }
  }
}

function slugify(title) {
  const t = (title || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return (t.slice(0, 80) || 'project').replace(/^-+|-+$/g, '');
}

const FEATURED = { brezovica: 1, 'vineyard-rahovec': 2, 'kfis-ddi': 3, 'municipal-gis': 4 };

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local first.');
  process.exit(1);
}

const force = process.argv.includes('--force');
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const read = (name) => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));
const projects = read('projects.json');
const services = read('services.json');
const milestones = read('milestones.json');
const manifest = read('media-manifest.json');

async function main() {
  const { count, error: countError } = await supabase.from('projects').select('*', { count: 'exact', head: true });
  if (countError) throw new Error(countError.message);
  if (count && !force) {
    console.log(`Already seeded (${count} projects). Re-run with --force to replace all content.`);
    return;
  }

  if (count && force) {
    console.log('--force: clearing existing content…');
    await supabase.from('project_images').delete().neq('project_id', 0);
    await supabase.from('projects').delete().neq('id', 0);
    await supabase.from('services').delete().neq('id', 0);
    await supabase.from('milestones').delete().neq('id', 0);
    await supabase.from('media').delete().neq('id', 0);
    await supabase.from('activity').delete().neq('id', 0);
  }

  const now = new Date().toISOString();

  const mediaIds = new Map();
  for (const m of manifest) {
    const { data, error } = await supabase
      .from('media')
      .insert({
        base: m.base,
        original_name: m.base.split('/').pop(),
        alt: m.alt,
        width: m.width,
        height: m.height,
        widths: m.widths.join(','),
        is_upload: 0,
        created_at: now,
      })
      .select('id')
      .single();
    if (error) throw new Error(`media ${m.base}: ${error.message}`);
    mediaIds.set(m.base, data.id);
  }

  for (const s of services) {
    const { error } = await supabase.from('services').insert({
      anchor: s.anchor,
      name: s.name,
      short_scope: s.short_scope,
      scope_items: s.scope_items,
      scope_paragraph: s.scope_paragraph,
      deliverables: s.deliverables,
      image_media_id: mediaIds.get(s.image) ?? null,
      sort: s.sort,
      published: 1,
      updated_at: now,
    });
    if (error) throw new Error(`service ${s.anchor}: ${error.message}`);
  }

  for (const m of milestones) {
    const { error } = await supabase.from('milestones').insert({
      year: m.year,
      text: m.text,
      sort: 100,
      published: 1,
      updated_at: now,
    });
    if (error) throw new Error(`milestone ${m.year}: ${error.message}`);
  }

  for (const p of projects) {
    const base = '/' + p.img.replace(/-\d+$/, '').replace(/^\/+/, '');
    const rank = FEATURED[p.id];
    const { error } = await supabase.from('projects').insert({
      slug: slugify(p.title),
      title: p.title,
      category: p.cat,
      year: p.year ?? null,
      org: p.org ?? '',
      description: p.desc ?? '',
      image_media_id: mediaIds.get(base) ?? null,
      featured: rank ? 1 : 0,
      featured_rank: rank ?? 100,
      published: 1,
      created_at: now,
      updated_at: now,
    });
    if (error) throw new Error(`project ${p.title}: ${error.message}`);
  }

  await supabase.from('activity').insert({
    actor: 'seed',
    action: 'create',
    entity: 'content',
    entity_id: null,
    summary: `Seeded ${projects.length} projects, ${services.length} services, ${milestones.length} milestones`,
  });

  console.log(
    `Seeded ${projects.length} projects, ${services.length} services, ${milestones.length} milestones, ${manifest.length} media rows.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
