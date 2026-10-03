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

loadEnv();

const [email, password] = process.argv.slice(2);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.local.example to .env.local first.');
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: npm run admin:create -- <email> <password>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(error.message);
  const existing = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(existing.id, { password });
    if (updateError) throw new Error(updateError.message);
    console.log(`admin password updated: ${email}`);
    return;
  }
  const { error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) throw new Error(createError.message);
  console.log(`admin created: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
