import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      }
    }
  }
}
loadEnv();

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function inspect() {
  await client.connect();

  // 1. Check profiles constraints
  const constraints = await client.query(`
    SELECT conname, contype, pg_get_constraintdef(oid) as def
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    ORDER BY contype, conname;
  `);
  console.log('\n=== profiles constraints ===');
  constraints.rows.forEach(r => console.log(r.conname, '|', r.contype, '|', r.def));

  // 2. Check existing rows in profiles
  const rows = await client.query('SELECT id, role, full_name_en FROM public.profiles LIMIT 5;');
  console.log('\n=== profiles rows (sample) ===');
  console.log(rows.rows);

  // 3. Check auth.users
  const authUsers = await client.query('SELECT id, email FROM auth.users LIMIT 5;');
  console.log('\n=== auth.users (sample) ===');
  console.log(authUsers.rows);

  await client.end();
}
inspect().catch(e => { console.error(e); client.end(); });
