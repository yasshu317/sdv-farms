import Razorpay from 'razorpay'
import { createClient } from '../../../../lib/supabase-server'

export const dynamic = 'force-dynamic'

const TOKEN_AMOUNT_PAISE = 50000  // ₹500

export async function POST(req) {
  try {
    const keyId     = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return Response.json({ error: 'Payment gateway not configured.' }, { status: 503 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorised' }, { status: 401 })

    const { appointment_id } = await req.json()
    if (!appointment_id) {
      return Response.json({ error: 'appointment_id is required' }, { status: 400 })
    }

    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const order = await rzp.orders.create({
      amount:   TOKEN_AMOUNT_PAISE,
      currency: 'INR',
      receipt:  `appt_${appointment_id}`.slice(0, 40),
      notes: {
        appointment_id,
        user_id: user.id,
        purpose: 'SDV Farms site visit token',
      },
    })

    // Persist order in DB
    await supabase.from('payment_orders').insert({
      user_id:           user.id,
      appointment_id,
      razorpay_order_id: order.id,
      amount_paise:      TOKEN_AMOUNT_PAISE,
      status:            'created',
    })

    return Response.json({
      order_id:    order.id,
      amount:      TOKEN_AMOUNT_PAISE,
      currency:    'INR',
      key_id:      keyId,
      prefill_email: user.email,
    })
  } catch (err) {
    console.error('[payment/create-order]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
