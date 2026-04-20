import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const body = await req.json()
    const { full_name, email, phone, service_type, property_location, area_acres, notes } = body

    if (!full_name?.trim() || !email?.trim() || !phone?.trim() || !service_type?.trim()) {
      return Response.json({ error: 'Name, email, phone and service type are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('service_bookings').insert({
      user_id:           user?.id ?? null,
      full_name:         full_name.trim(),
      email:             email.trim().toLowerCase(),
      phone:             phone.trim(),
      service_type,
      property_location: property_location?.trim() || null,
      area_acres:        area_acres ? Number(area_acres) : null,
      notes:             notes?.trim() || null,
      status:            'pending',
    })

    if (error) throw error

    // Send confirmation email
    const SERVICE_LABELS = {
      fencing:      'Compound Fencing',
      borewell:     'Borewell & Electricity',
      drip:         'Drip Irrigation',
      farming_plan: 'Farming Plan',
      plants:       'Quality Plants',
    }
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ''}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email.trim().toLowerCase(),
        subject: `SDV Farms — Service Enquiry Received: ${SERVICE_LABELS[service_type] ?? service_type}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
            <h2 style="color:#175239">Thank you, ${full_name}! 🌾</h2>
            <p>We've received your enquiry for <strong>${SERVICE_LABELS[service_type] ?? service_type}</strong>.</p>
            <p>Our team will call you at <strong>${phone}</strong> within 24 hours to discuss details and pricing.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="font-size:12px;color:#999">SDV Farms · Hyderabad, Telangana · 7780312525</p>
          </div>
        `,
      }),
    }).catch(() => {})

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
