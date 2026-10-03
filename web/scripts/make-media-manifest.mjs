import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import sharp from 'sharp';

const here = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const projects = JSON.parse(fs.readFileSync(path.join(root, 'data', 'projects.json'), 'utf8'));

const SERVICE_IMAGES = [
  ['/assets/img/services/gis', 'GIS & Software Development'],
  ['/assets/img/services/surveying', 'Surveying'],
  ['/assets/img/services/mapping', 'Mapping & Remote Sensing'],
  ['/assets/img/services/agriculture', 'Agriculture & Forestry'],
  ['/assets/img/services/orthophotos', 'Orthophotos'],
  ['/assets/img/uav/surveying-1', 'Aerial Data Collection — UAV Surveying'],
];

const bases = new Map();
for (const p of projects) {
  const base = '/' + p.img.replace(/-\d+$/, '').replace(/^\/+/, '');
  if (!bases.has(base)) bases.set(base, p.title);
}
for (const [base, alt] of SERVICE_IMAGES) {
  if (!bases.has(base)) bases.set(base, alt);
}

const manifest = [];
for (const [base, alt] of bases) {
  const dir = path.join(root, 'public', base.replace(/^\//, '').split('/').slice(0, -1).join('/'));
  const stem = base.split('/').pop();
  const widths = new Set();
  if (fs.existsSync(dir)) {
    for (const fn of fs.readdirSync(dir)) {
      const m = fn.match(new RegExp('^' + stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-(\\d+)\\.(?:jpg|webp)$'));
      if (m) widths.add(Number(m[1]));
    }
  }
  const sorted = [...widths].sort((a, b) => b - a);
  if (!sorted.length) {
    console.warn('  !! no variant files for', base);
    continue;
  }
  const big = path.join(root, 'public', base.replace(/^\//, '') + '-' + sorted[0] + '.jpg');
  let width = sorted[0];
  let height = sorted[0];
  if (fs.existsSync(big)) {
    const meta = await sharp(big).metadata();
    width = meta.width || width;
    height = meta.height || height;
  }
  manifest.push({ base, alt, width, height, widths: sorted });
}

const out = path.join(root, 'data', 'media-manifest.json');
fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(`media manifest: ${manifest.length} entries -> data/media-manifest.json`);
