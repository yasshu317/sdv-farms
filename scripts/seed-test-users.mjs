/**
 * Seed three test accounts: admin, seller, buyer.
 * Uses the Supabase Admin API so passwords are set directly
 * (no email confirmation required).
 *
 * Usage:
 *   node scripts/seed-test-users.mjs
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Load .env.local manually (no dotenv dependency needed) ───────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
let env = {}
try {
  const raw = readFileSync(envPath, 'utf8')
  raw.split('\n').forEach(line => {
    const [k, ...rest] = line.split('=')
    if (k && !k.startsWith('#')) env[k.trim()] = rest.join('=').trim()
  })
} catch {
  console.error('❌  Could not read .env.local — make sure it exists in the project root.')
  process.exit(1)
}

const SUPABASE_URL      = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local')
  process.exit(1)
}

// ── Admin client bypasses RLS and email confirmation ─────────────────────────
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Test user definitions ─────────────────────────────────────────────────────
// Using real accounts (all owned by Yash) — just resets password to a known
// value so you can log in quickly during flow testing.
const TEST_USERS = [
  {
    email:    'yaswanth4urs@gmail.com',
    password: 'Test@1234',
    meta: { full_name: 'Yash', role: 'admin' },
    label: '⚙️  Admin',
  },
  {
    email:    'yashfse@gmail.com',
    password: 'Test@1234',
    meta: { full_name: 'Yash', role: 'seller', seller_type: 'farmer' },
    label: '🌾 Seller',
  },
  {
    email:    'rorchow@gmail.com',
    password: 'Test@1234',
    meta: { full_name: 'Yash', role: 'buyer' },
    label: '🏡 Buyer',
  },
]

async function upsertUser({ email, password, meta, label }) {
  // Check if user already exists
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find(u => u.email === email)

  if (existing) {
    // Update password + metadata in case they changed
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: meta,
      email_confirm: true,
    })
    if (error) {
      console.error(`  ✗ Could not update ${label} (${email}): ${error.message}`)
    } else {
      console.log(`  ↻ Updated  ${label}  ${email}`)
    }
    return
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,       // skip confirmation email
    user_metadata: meta,
  })

  if (error) {
    console.error(`  ✗ Could not create ${label} (${email}): ${error.message}`)
  } else {
    console.log(`  ✓ Created  ${label}  ${email}`)
  }
}

console.log('\n🌱  Seeding SDV Farms test users…\n')
for (const u of TEST_USERS) {
  await upsertUser(u)
}

console.log(`
─────────────────────────────────────────────────
 Test credentials (all passwords: Test@1234)
─────────────────────────────────────────────────
 ⚙️  Admin   → yaswanth4urs@gmail.com
 🌾 Seller  → yashfse@gmail.com
 🏡 Buyer   → rorchow@gmail.com
─────────────────────────────────────────────────
 URL: http://localhost:3000/auth/login
─────────────────────────────────────────────────
`)
