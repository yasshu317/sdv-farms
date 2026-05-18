import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

const SYSTEM_PROMPT = `You are the SDV Farms virtual assistant — a helpful, friendly, and concise AI for an agricultural land investment platform in Telangana, India.

About SDV Farms:
- Located near Hyderabad, Telangana
- Sells legally verified agricultural farmland plots (government-approved layout, Phase 1)
- Contact: +91 7780312525
- Services offered: Land fencing, borewell drilling, drip irrigation, farming plan consultation, farmhouse construction, fertilizers & nutrition
- Buyers can browse available properties, wishlist them, book site visits, and post land requests
- Sellers can list their land by registering and submitting a property form
- Appointments can be booked for site visits
- Documents available: lease agreements, registration formats, pahani/RTC records

Guidelines:
- Keep replies short and helpful (2–4 sentences max unless a list is needed)
- Use simple English or Telugu based on the user's language
- For pricing, say rates vary by plot — direct them to browse listings or call the team
- For legal queries, mention that all plots are government-approved and documents are verified
- For anything urgent or not covered, suggest calling +91 7780312525 or visiting /properties
- Never make up specific plot prices, sizes, or availability numbers
- If asked in Telugu, reply in Telugu
- Do not answer questions unrelated to SDV Farms or land/farming in India`

export async function POST(req) {
  try {
    const { message, history = [], lang = 'en' } = await req.json()

    if (!message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'AI service not configured' }, { status: 503 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_PROMPT,
    })

    // Convert history to Gemini format (role: 'user' | 'model')
    const geminiHistory = history.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    // Prepend a hard language instruction so Gemini always responds in the UI language
    const langInstruction = lang === 'te'
      ? '[IMPORTANT: Reply ONLY in Telugu (తెలుగు). Do not use English.]\n\n'
      : '[IMPORTANT: Reply ONLY in English.]\n\n'

    const chat = model.startChat({ history: geminiHistory })
    const result = await chat.sendMessage(langInstruction + message)
    const text = result.response.text()

    return Response.json({ reply: text })
  } catch (err) {
    console.error('[/api/chat]', err)
    return Response.json({ error: 'Failed to get a response' }, { status: 500 })
  }
}
