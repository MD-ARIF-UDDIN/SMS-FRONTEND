import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Client } = pkg;

// Simple .env parser helper
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

// Reads DATABASE_URL or SUPABASE_DB_URL from .env
const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.log('\n❌ DATABASE_URL is not set in your .env file.');
  console.log('To run migrations directly from here, add your Supabase Postgres Connection String to .env:');
  console.log('DATABASE_URL=postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres\n');
  console.log('You can find your Database Connection String in Supabase Dashboard -> Project Settings -> Database -> Connection String (URI).\n');
  process.exit(1);
}

async function runMigration() {
  console.log('Connecting directly to Supabase Postgres database...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! Reading supabase_schema.sql...');
    
    const sqlPath = path.join(process.cwd(), 'supabase_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing database migrations directly...');
    await client.query(sqlContent);
    console.log('✅ All tables, extensions, and schemas created directly from workspace!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();
