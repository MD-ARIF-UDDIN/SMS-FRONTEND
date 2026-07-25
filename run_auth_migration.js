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

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.log('\n❌ DATABASE_URL is not set in your .env file.');
  process.exit(1);
}

async function runAuthMigration() {
  console.log('Connecting to Supabase Postgres...');
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected! Running auth migration...');

    const sqlPath = path.join(process.cwd(), 'auth_migration.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    await client.query(sqlContent);
    console.log('✅ Auth migration complete! profiles table now linked to auth.users, trigger created.');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

runAuthMigration();
