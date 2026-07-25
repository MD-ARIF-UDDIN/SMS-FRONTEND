/**
 * Creates test users in Supabase Auth with correct roles in app_metadata.
 * Uses the Supabase Admin API (service_role key required).
 * 
 * Usage: node create_test_users.js <SERVICE_ROLE_KEY>
 * 
 * You can find your service_role key at:
 * Supabase Dashboard → Project Settings → API → service_role (secret key)
 */

import { createClient } from '@supabase/supabase-js';
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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ Service role key is required.');
  console.error('Usage: node create_test_users.js <YOUR_SERVICE_ROLE_KEY>');
  console.error('\nFind it at: Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TEST_USERS = [
  { email: 'admin@gmail.com',   password: 'admin123456',   role: 'admin',   name: 'System Admin' },
  { email: 'teacher@gmail.com', password: 'teacher123456', role: 'teacher', name: 'Demo Teacher' },
  { email: 'student@gmail.com', password: 'student123456', role: 'student', name: 'Demo Student' },
];

async function createTestUsers() {
  console.log('\n🚀 Creating test users in Supabase Auth...\n');

  for (const user of TEST_USERS) {
    try {
      // Create user with email_confirm = true so they can log in immediately
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        app_metadata: { role: user.role },
        user_metadata: { full_name: user.name },
      });

      if (error) {
        if (error.message?.includes('already been registered')) {
          // User exists — update their app_metadata role
          const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = existing?.users?.find(u => u.email === user.email);
          if (existingUser) {
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
              app_metadata: { role: user.role },
              email_confirm: true,
            });
            // Ensure profile row exists
            await supabaseAdmin.from('profiles').upsert({
              id: existingUser.id,
              role: user.role,
              full_name_en: user.name,
            }, { onConflict: 'id' });
            console.log(`✅ Updated existing user: ${user.email} (role: ${user.role})`);
          }
        } else {
          console.error(`❌ Failed to create ${user.email}:`, error.message);
        }
      } else {
        // Manually create profile row (trigger may not fire for admin-created users in some Supabase versions)
        await supabaseAdmin.from('profiles').upsert({
          id: data.user.id,
          role: user.role,
          full_name_en: user.name,
        }, { onConflict: 'id' });
        console.log(`✅ Created: ${user.email} (role: ${user.role}, id: ${data.user.id})`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error for ${user.email}:`, err.message);
    }
  }

  console.log('\n🎉 Done! Test users are ready. You can now log in with:');
  TEST_USERS.forEach(u => console.log(`   ${u.role.padEnd(8)}: ${u.email} / ${u.password}`));
  console.log('');
}

createTestUsers();
