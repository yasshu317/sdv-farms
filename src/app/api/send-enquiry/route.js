import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { name, phone, email, message } = await req.json()

    await resend.emails.send({
      from: 'SDV Farms <onboarding@resend.dev>',
      to: ['yaswanth4urs@gmail.com'],
      subject: `New Enquiry from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fdf8f0;border-radius:12px;">
          <div style="background:linear-gradient(135deg,#1a4520,#286d2f);padding:24px;border-radius:8px;margin-bottom:24px;">
            <h1 style="color:#f1c929;margin:0;font-size:24px;">🌾 SDV Farms</h1>
            <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:14px;">New Site Visit Enquiry</p>
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px;background:#fff;border-radius:8px 8px 0 0;border-bottom:1px solid #f3ead8;">
                <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Name</span><br>
                <strong style="color:#1a4520;font-size:16px;">${name}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:12px;background:#fff;border-bottom:1px solid #f3ead8;">
                <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Phone</span><br>
                <strong style="color:#1a4520;font-size:16px;">${phone}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:12px;background:#fff;border-bottom:1px solid #f3ead8;">
                <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</span><br>
                <strong style="color:#1a4520;font-size:16px;">${email || 'Not provided'}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:12px;background:#fff;border-radius:0 0 8px 8px;">
                <span style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Message</span><br>
                <p style="color:#333;margin:4px 0 0;">${message || 'No message provided'}</p>
              </td>
            </tr>
          </table>

          <div style="margin-top:20px;padding:16px;background:#fff8e1;border-radius:8px;border-left:4px solid #f1c929;">
            <p style="margin:0;color:#7c5c00;font-size:14px;">
              📱 Call back: <strong><a href="tel:${phone}" style="color:#1a4520;">${phone}</a></strong>
            </p>
          </div>

          <p style="color:#aaa;font-size:12px;text-align:center;margin-top:20px;">
            SDV Farms Phase 1 · Hyderabad, Telangana
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
