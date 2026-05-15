import { createClient } from '../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const body = await req.json()
    const { business_name, contact_name, email, phone, feedback_type, message, rating } = body

    if (!business_name?.trim()) {
      return Response.json({ error: 'Business name is required.' }, { status: 400 })
    }
    if (!message?.trim()) {
      return Response.json({ error: 'Feedback message is required.' }, { status: 400 })
    }

    const validTypes = ['general', 'suggestion', 'complaint', 'partnership', 'other']
    const type = validTypes.includes(feedback_type) ? feedback_type : 'general'

    const parsedRating = rating ? Number(rating) : null
    if (parsedRating !== null && (parsedRating < 1 || parsedRating > 5)) {
      return Response.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('business_feedback').insert({
      business_name: business_name.trim(),
      contact_name:  contact_name?.trim() || null,
      email:         email?.trim().toLowerCase() || null,
      phone:         phone?.trim() || null,
      feedback_type: type,
      message:       message.trim(),
      rating:        parsedRating,
      status:        'new',
    })

    if (error) throw error

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
