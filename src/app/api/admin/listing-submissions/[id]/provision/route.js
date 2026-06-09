import { NextResponse } from 'next/server'
import { createClient } from '../../../../../../lib/supabase-server'
import { createAdminClient } from '../../../../../../lib/supabase-admin'
import { isAdminOrStaff } from '../../../../../../lib/roles'

/**
 * POST /api/admin/listing-submissions/[id]/provision
 * Body: { seller_id: string }
 *
 * 1. Fetches the lead
 * 2. Creates a seller_properties row pre-populated from lead data (status: pending)
 * 3. Updates the lead: seller_id, converted_listing_id, status → converted
 * 4. Returns { property_id }
 */
export async function POST(req, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminOrStaff(user.user_metadata?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { seller_id } = body
  if (!seller_id) {
    return NextResponse.json({ error: 'seller_id is required' }, { status: 400 })
  }

  const { id } = await params
  const admin = createAdminClient()

  // 1. Fetch the lead
  const { data: lead, error: leadErr } = await admin
    .from('listing_submissions')
    .select('*')
    .eq('id', id)
    .single()

  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  if (lead.converted_listing_id) {
    return NextResponse.json({ error: 'Lead already provisioned', property_id: lead.converted_listing_id }, { status: 409 })
  }

  // 2. Create seller_properties row pre-populated from lead
  const { data: property, error: propErr } = await admin
    .from('seller_properties')
    .insert({
      seller_id,
      state:          lead.state,
      district:       lead.district,
      mandal:         lead.mandal,
      village:        lead.village,
      farmer_name:    lead.farmer_name,
      land_used_type: lead.land_used_type,
      land_soil_type: lead.land_soil_type,
      area_acres:     lead.area_acres,
      expected_price: lead.expected_price,
      road_access:    lead.road_access ?? false,
      doc_urls:       lead.doc_urls ?? [],
      photo_urls:     lead.photo_urls ?? [],
      status:         'pending',
      metadata: {
        provisioned_from_lead: id,
        submitter_name: `${lead.submitter_first_name} ${lead.submitter_last_name}`,
        submitter_mobile: lead.submitter_mobile,
      },
    })
    .select('id')
    .single()

  if (propErr) {
    console.error('[provision] create property error:', propErr)
    return NextResponse.json({ error: 'Failed to create property listing' }, { status: 500 })
  }

  // 3. Update the lead
  const { error: updateErr } = await admin
    .from('listing_submissions')
    .update({
      seller_id,
      converted_listing_id: property.id,
      status: 'converted',
    })
    .eq('id', id)

  if (updateErr) {
    console.error('[provision] update lead error:', updateErr)
    // property was created — return its id even if lead update partially fails
    return NextResponse.json({ error: 'Property created but lead update failed', property_id: property.id }, { status: 500 })
  }

  return NextResponse.json({ property_id: property.id }, { status: 201 })
}
