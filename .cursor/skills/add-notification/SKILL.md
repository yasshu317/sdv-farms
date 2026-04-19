# Skill: Add a New Notification Type

Use this skill when you need to send a new type of email (or future: SMS/WhatsApp).

## Step 1 — Add a template to `src/lib/notify.js`

```js
// In the TEMPLATES object in src/lib/notify.js:
your_event_type: ({ param1, param2 }) => ({
  subject: `SDV Farms — Your Subject Here`,
  html: `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#175239">Title 🌾</h2>
      <p>Message body with ${param1} and ${param2}.</p>
      <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
      <p style="font-size:12px;color:#999">SDV Farms Phase 1 · Hyderabad, Telangana</p>
    </div>
  `,
}),
```

## Step 2 — Call it from your component or API route

```js
// In a client component:
import { sendNotification } from '../lib/notify'

await sendNotification({
  to: user.email,
  type: 'your_event_type',
  data: { param1: 'value1', param2: 'value2' },
})

// In an API route (server-side):
await fetch('/api/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ to, subject, html }),
})
```

## Step 3 — Write a test

Add a test case in `src/__tests__/notify.test.js`:
```js
it('sends your_event_type email with correct fields', async () => {
  fetch.mockResolvedValueOnce({ ok: true })
  const { sendNotification } = await import('../lib/notify.js')
  await sendNotification({
    to: 'test@example.com',
    type: 'your_event_type',
    data: { param1: 'x', param2: 'y' },
  })
  const body = JSON.parse(fetch.mock.calls[0][1].body)
  expect(body.subject).toContain('Your Subject Here')
})
```

## Future channels (no component changes needed)

To add SMS or WhatsApp later, only update `/api/notify/route.js` — all `sendNotification()` calls stay the same.
