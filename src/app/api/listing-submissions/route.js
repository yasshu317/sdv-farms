import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase-admin'

const REQUIRED = [
  'submitter_first_name',
  'submitter_last_name',
  'submitter_mobile',
  'state',
  'district',
  'mandal',
  'village',
  'farmer_name',
]

export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  for (const field of REQUIRED) {
    if (!body[field] || String(body[field]).trim() === '') {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
    }
  }

  const row = {
    submitter_first_name: String(body.submitter_first_name).trim(),
    submitter_last_name:  String(body.submitter_last_name).trim(),
    submitter_mobile:     String(body.submitter_mobile).trim(),
    submitter_email:      body.submitter_email ? String(body.submitter_email).trim() : null,
    state:                String(body.state).trim(),
    district:             String(body.district).trim(),
    mandal:               String(body.mandal).trim(),
    village:              String(body.village).trim(),
    location_notes:       body.location_notes ? String(body.location_notes).trim() : null,
    farmer_name:          String(body.farmer_name).trim(),
    farmer_phone:         body.farmer_phone ? String(body.farmer_phone).trim() : null,
    land_used_type:       body.land_used_type || null,
    land_soil_type:       body.land_soil_type || null,
    area_acres:           body.area_acres ? Number(body.area_acres) : null,
    expected_price:       body.expected_price ? Number(body.expected_price) : null,
    seller_interest:      body.seller_interest || null,
    road_access:          Boolean(body.road_access),
    doc_urls:             Array.isArray(body.doc_urls) ? body.doc_urls : [],
    photo_urls:           Array.isArray(body.photo_urls) ? body.photo_urls : [],
    status:               'new',
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('listing_submissions')
    .insert(row)
    .select('id')
    .single()

  if (error) {
    console.error('[listing-submissions] insert error:', error)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
