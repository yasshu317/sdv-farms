'use client'
import { useState, useEffect } from 'react'

/**
 * Razorpay ₹500 token payment button.
 * Props:
 *   appointmentId  — UUID of the appointment to pay for
 *   onSuccess      — callback called after signature verified
 *   onError        — callback called on failure
 */
export default function PaymentButton({ appointmentId, onSuccess, onError }) {
  const [loading, setLoading]   = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  // Load Razorpay checkout.js once
  useEffect(() => {
    if (window.Razorpay) { setScriptLoaded(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => setScriptLoaded(true)
    document.head.appendChild(s)
  }, [])

  async function handlePay() {
    setLoading(true)
    try {
      // 1. Create order on our server
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appointmentId }),
      })
      const order = await res.json()
      if (!res.ok) throw new Error(order.error || 'Could not create order')

      // 2. Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         order.key_id,
          amount:      order.amount,
          currency:    order.currency,
          name:        'SDV Farms',
          description: 'Site Visit Token — ₹500',
          image:       '/icons/icon-192.png',
          order_id:    order.order_id,
          prefill: { email: order.prefill_email },
          theme: { color: '#175239' },
          handler: async (response) => {
            // 3. Verify signature on server
            const vRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            })
            const vData = await vRes.json()
            if (!vRes.ok) return reject(new Error(vData.error || 'Verification failed'))
            resolve(vData)
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        })
        rzp.on('payment.failed', (response) => reject(new Error(response.error.description)))
        rzp.open()
      })

      onSuccess?.()
    } catch (err) {
      onError?.(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading || !scriptLoaded}
      className="w-full bg-turmeric-600 hover:bg-turmeric-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing…
        </span>
      ) : (
        <>💳 Pay ₹500 Site Visit Token</>
      )}
    </button>
  )
}
