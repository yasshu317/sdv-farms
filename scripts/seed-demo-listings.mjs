/**
 * Seeds 10 approved demo listings + optional buyer_wishlist ("Interested" ♥ counts for sellers).
 *
 * Prerequisites (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Env overrides:
 *   DEMO_SELLER_EMAIL   (default: yashfse@gmail.com — must exist in Auth)
 *   DEMO_BUYER_EMAIL    (default: rorchow@gmail.com — wishlist seeds)
 *   DEMO_WISHLIST_COUNT number of listings the buyer shorts (default: 4, max 10)
 *
 * Idempotent-ish: deletes previous rows where property_id like 'SDV-DEMO-%' for that seller
 * (wishlist + appointments + listings), then inserts fresh demos.
 *
 * Usage:
 *   node scripts/seed-demo-listings.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, '../.env.local')
let rawEnv = {}
try {
  rawEnv = Object.fromEntries(
    readFileSync(envPath, 'utf8')
      .split('\n')
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => {
        const idx = l.indexOf('=')
        return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
      })
  )
} catch {
  console.error('Missing .env.local — copy .env.example and add SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const SUPABASE_URL = rawEnv.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = rawEnv.SUPABASE_SERVICE_ROLE_KEY
const SELLER_EMAIL = process.env.DEMO_SELLER_EMAIL || 'yashfse@gmail.com'
const BUYER_EMAIL = process.env.DEMO_BUYER_EMAIL || 'rorchow@gmail.com'
const WISHLIST_N = Math.min(10, Math.max(0, Number(process.env.DEMO_WISHLIST_COUNT ?? 4) || 0))

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  process.exit(1)
}

const adminDb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserByEmail(email) {
  let page = 1
  const per = 200
  for (;;) {
    const { data, error } = await adminDb.auth.admin.listUsers({ page, perPage: per })
    if (error) throw error
    const u = data.users.find(x => x.email?.toLowerCase() === email.toLowerCase())
    if (u) return u
    if (data.users.length < per) break
    page += 1
  }
  return null
}

const DISTRICT_ROWS = [
  ['Telangana', 'Nalgonda', 'Suryapet', 'Mattapalle'],
  ['Telangana', 'Warangal', 'Hanamkonda', 'Kazipet'],
  ['Telangana', 'Karimnagar', 'Karimnagar', 'Ramagundam'],
  ['Telangana', 'Khammam', 'Khammam', 'Palvancha'],
  ['Telangana', 'Medchal-Malkajgiri', 'Medchal', 'Keesara'],
  ['Telangana', 'Rangareddy', 'Shamshabad', 'Rajendranagar'],
  ['Telangana', 'Nizamabad', 'Armoor', 'Bodhan'],
  ['Telangana', 'Mahabubnagar', 'Wanaparthy', 'Narayanpet'],
  ['Telangana', 'Adilabad', 'Nirmal', 'Mancherial'],
  ['Telangana', 'Karimnagar', 'Peddapalli', 'Ramagundam'],
]

function buildRows(sellerId) {
  const soils = ['Black', 'Red', 'Sandy', 'Mixed']
  return DISTRICT_ROWS.map(([state, district, mandal, village], i) => ({
    seller_id: sellerId,
    property_id: `SDV-DEMO-${String(i + 1).padStart(3, '0')}`,
    state,
    district,
    mandal,
    village: `${village} (demo)`,
    zip_code: '500001',
    farmer_name: `Demo Farmer ${i + 1}`,
    owner_relation: 'Self',
    land_used_type: 'Agriculture',
    land_soil_type: soils[i % soils.length],
    land_doc_type: state === 'Telangana' ? 'Pahani / ROR-1B' : 'Adangal / 1B',
    road_access: i % 3 !== 0,
    area_acres: Number((3 + i * 0.4).toFixed(2)),
    expected_price: 420_000 + i * 12_000,
    doc_urls: [],
    photo_urls: [],
    seller_interest: 'ready_to_sale',
    doc_verified: true,
    status: 'approved',
    views: 10 + i * 3,
    metadata: {},
  }))
}

console.log('\n🌾  Seeding demo listings (SDV-DEMO-*)\n')

const seller = await findUserByEmail(SELLER_EMAIL)
if (!seller) {
  console.error(`Seller not found: ${SELLER_EMAIL} — create user first (see scripts/seed-test-users.mjs).`)
  process.exit(1)
}

const buyer = WISHLIST_N > 0 ? await findUserByEmail(BUYER_EMAIL) : null
if (WISHLIST_N > 0 && !buyer) {
  console.error(`Buyer not found: ${BUYER_EMAIL} — cannot seed wishlist. Set DEMO_WISHLIST_COUNT=0 or create user.`)
  process.exit(1)
}

/** @type {{ id: string }[] | null} */
const existing = await adminDb
  .from('seller_properties')
  .select('id')
  .eq('seller_id', seller.id)
  .like('property_id', 'SDV-DEMO-%')

const ids = (existing.data ?? []).map(r => r.id)
if (ids.length) {
  await adminDb.from('buyer_wishlist').delete().in('property_id', ids)
  await adminDb.from('appointments').delete().in('property_id', ids)
  await adminDb.from('seller_properties').delete().in('id', ids)
  console.log(`Removed ${ids.length} previous SDV-DEMO-* row(s).\n`)
}

const rows = buildRows(seller.id)
const { data: inserted, error: insErr } = await adminDb.from('seller_properties').insert(rows).select('id, property_id, village')

if (insErr) {
  console.error('Insert failed:', insErr.message)
  process.exit(1)
}

console.log(`Inserted ${inserted.length} approved listings for seller ${SELLER_EMAIL}.\n`)
inserted.slice(0, 5).forEach(r => console.log(`   • ${r.property_id} — ${r.village}`))
if (inserted.length > 5) console.log(`   • …`)

if (WISHLIST_N > 0 && buyer) {
  const targets = inserted.slice(0, WISHLIST_N)
  const wlRows = targets.map(sp => ({
    buyer_id: buyer.id,
    property_id: sp.id,
  }))
  const { error: wlErr } = await adminDb.from('buyer_wishlist').insert(wlRows)
  if (wlErr) {
    console.error('Wishlist seed failed:', wlErr.message)
    process.exit(1)
  }
  console.log(`\n♥  Added ${targets.length} shortlist rows for buyer ${BUYER_EMAIL}`)
  console.log('   → Seller dashboard shows per-row “Interested” counts + Total Interested.\n')
}

console.log('Open (local):\n')
console.log('   Browse: http://localhost:3000/properties')
console.log(`   Seller: http://localhost:3000/seller`)
console.log(`   Buyer dashboard (shortlist): http://localhost:3000/dashboard?tab=land-shortlist`)
console.log('')
