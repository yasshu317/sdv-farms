// Notification abstraction layer
// Today: email via Resend API route
// Future: add SMS, WhatsApp, push notifications here — zero component changes needed

const TEMPLATES = {
  appointment_confirmed: ({ date, slot, propertyId, type }) => ({
    subject: `SDV Farms — Appointment Confirmed`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#175239">Appointment Confirmed 🌾</h2>
        <p>Your ${type === 'seller' ? 'call' : 'site visit'} has been booked.</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Date</td><td style="padding:8px;border:1px solid #ddd">${date}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Time</td><td style="padding:8px;border:1px solid #ddd">${slot}</td></tr>
          ${propertyId ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Property</td><td style="padding:8px;border:1px solid #ddd">${propertyId}</td></tr>` : ''}
        </table>
        <p style="color:#666;margin-top:16px">SDV Farms team will contact you shortly to confirm details.</p>
        <p style="color:#666">Questions? Call us: <strong>7780312525</strong></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999">SDV Farms Phase 1 · Hyderabad, Telangana</p>
      </div>
    `,
  }),

  property_approved: ({ propertyId, state, district }) => ({
    subject: `SDV Farms — Your Property ${propertyId} is Now Live!`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#175239">Your Property is Live! 🌾</h2>
        <p>Great news! Your property has been approved and is now visible to buyers.</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Property ID</td><td style="padding:8px;border:1px solid #ddd">${propertyId}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Location</td><td style="padding:8px;border:1px solid #ddd">${district}, ${state}</td></tr>
        </table>
        <p style="margin-top:16px"><a href="https://sdv-farms.vercel.app/seller" style="background:#175239;color:white;padding:10px 20px;text-decoration:none;border-radius:6px">View My Listings</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999">SDV Farms Phase 1 · Hyderabad, Telangana</p>
      </div>
    `,
  }),

  property_rejected: ({ state, district, reason }) => ({
    subject: `SDV Farms — Property Submission Update`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#175239">Property Submission Update</h2>
        <p>We reviewed your property submission for <strong>${district}, ${state}</strong>.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please contact us to discuss or resubmit: <strong>7780312525</strong></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999">SDV Farms Phase 1 · Hyderabad, Telangana</p>
      </div>
    `,
  }),

  new_enquiry: ({ name, phone, propertyId }) => ({
    subject: `SDV Farms — New Enquiry on ${propertyId}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
        <h2 style="color:#175239">New Enquiry Received 🌾</h2>
        <p>A buyer is interested in your property <strong>${propertyId}</strong>.</p>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Buyer Name</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="font-size:12px;color:#999">SDV Farms Phase 1 · Hyderabad, Telangana</p>
      </div>
    `,
  }),
}

/**
 * Send a notification email
 * @param {{ to: string, type: string, data: object }} options
 *
 * Usage:
 *   await sendNotification({ to: user.email, type: 'appointment_confirmed', data: { date, slot, propertyId, type: 'buyer' } })
 */
export async function sendNotification({ to, type, data }) {
  const template = TEMPLATES[type]
  if (!template) {
    console.warn(`[notify] Unknown template: ${type}`)
    return
  }

  const { subject, html } = template(data)

  try {
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    })
    if (!res.ok) throw new Error(await res.text())
  } catch (err) {
    console.error('[notify] Failed to send notification:', err)
  }
}
