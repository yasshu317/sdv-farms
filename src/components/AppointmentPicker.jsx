'use client'
import { useState } from 'react'
import { createClient } from '../lib/supabase'
import { sendNotification } from '../lib/notify'
import PaymentButton from './PaymentButton'

const SLOTS = [
  '9AM-10AM','10AM-11AM','11AM-12PM','12PM-1PM',
  '1PM-2PM','2PM-3PM','3PM-4PM','4PM-5PM','5PM-6PM',
]

function getMinDate() {
  return new Date().toISOString().split('T')[0]
}

function getMaxDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}

function isSlotDisabled(date, slot) {
  const today = new Date().toISOString().split('T')[0]
  if (date !== today) return false
  const hour = parseInt(slot.split('AM')[0].split('PM')[0]) + (slot.includes('PM') && !slot.startsWith('12') ? 12 : 0)
  const nowHour = new Date().getHours()
  return hour <= nowHour + 2
}

export default function AppointmentPicker({ propertyId, type = 'buyer', userEmail, onBooked, onCancel }) {
  const [date, setDate]       = useState('')
  const [slot, setSlot]       = useState('')
  const [notes, setNotes]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]         = useState(false)
  const [pendingPay, setPendingPay] = useState(null)  // { appointmentId, date, slot }
  const [payError, setPayError] = useState('')
  const [payDone, setPayDone]   = useState(false)

  async function handleBook() {
    if (!date || !slot) { setError('Please select a date and time slot'); return }
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Please sign in to book an appointment'); setLoading(false); return }

    const { data: apptData, error: insertErr } = await supabase.from('appointments').insert({
      user_id:          user.id,
      property_id:      propertyId || null,
      appointment_date: date,
      time_slot:        slot,
      appointment_type: type,
      notes,
    }).select('id').single()

    if (insertErr) { setError(insertErr.message); setLoading(false); return }

    // Send confirmation email
    await sendNotification({
      to: userEmail || user.email,
      type: 'appointment_confirmed',
      data: { date, slot, propertyId, type },
    })

    setLoading(false)

    // If Razorpay is configured, show payment step
    if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setPendingPay({ appointmentId: apptData.id, date, slot })
    } else {
      setDone(true)
      onBooked?.({ date, slot })
    }
  }

  if (pendingPay && !payDone) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="text-white font-semibold text-base mb-1">Appointment Confirmed!</h3>
          <p className="text-white/60 text-sm">{pendingPay.date} · {pendingPay.slot}</p>
          <p className="text-white/40 text-xs mt-2 mb-4">
            Pay a refundable ₹500 token to confirm your site visit slot.
          </p>
        </div>
        {payError && <p className="text-red-400 text-xs text-center">{payError}</p>}
        <PaymentButton
          appointmentId={pendingPay.appointmentId}
          onSuccess={() => { setPayDone(true); setDone(true); onBooked?.(pendingPay) }}
          onError={msg => setPayError(msg)}
        />
        <button
          onClick={() => { setDone(true); onBooked?.(pendingPay) }}
          className="w-full text-white/40 hover:text-white/60 text-xs py-2 transition-colors"
        >
          Skip payment for now →
        </button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">{payDone ? '🎉' : '✅'}</div>
        <h3 className="text-white font-semibold text-lg mb-1">
          {payDone ? 'Payment Received!' : 'Appointment Booked!'}
        </h3>
        <p className="text-white/60 text-sm">
          {date} · {slot}
        </p>
        <p className="text-white/40 text-xs mt-2">A confirmation email has been sent. SDV Farms will contact you shortly.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-white/70 text-sm mb-1.5">Select Date</label>
        <input
          type="date"
          min={getMinDate()}
          max={getMaxDate()}
          value={date}
          onChange={e => { setDate(e.target.value); setSlot('') }}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turmeric-400 transition-colors text-sm"
        />
      </div>

      {date && (
        <div>
          <label className="block text-white/70 text-sm mb-2">Select Time Slot</label>
          <div className="grid grid-cols-3 gap-2">
            {SLOTS.map(s => {
              const disabled = isSlotDisabled(date, s)
              return (
                <button
                  key={s} type="button"
                  onClick={() => !disabled && setSlot(s)}
                  disabled={disabled}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                    slot === s
                      ? 'bg-turmeric-500 text-white border border-turmeric-400'
                      : disabled
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  {s}
                </button>
              )
            })}
          </div>
          {date === getMinDate() && (
            <p className="text-white/35 text-xs mt-2">Slots within 2 hours of now are unavailable</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-white/70 text-sm mb-1.5">Notes (optional)</label>
        <textarea
          value={notes} onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Any specific questions or requirements…"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/35 focus:outline-none focus:border-turmeric-400 transition-colors text-sm resize-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button" onClick={onCancel}
            className="flex-1 bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="button" onClick={handleBook} disabled={loading || !date || !slot}
          className="flex-1 bg-turmeric-500 hover:bg-turmeric-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? 'Booking…' : 'Confirm Appointment'}
        </button>
      </div>
    </div>
  )
}
