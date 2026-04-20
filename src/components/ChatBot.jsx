'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, X, Send, User } from 'lucide-react'

const QUICK_QUESTIONS = [
  { en: 'Browse Properties',          te: 'ప్రాపర్టీలు చూడండి', link: '/properties' },
  { en: 'How to sell my land?',       te: 'నా భూమి ఎలా అమ్మాలి?' },
  { en: 'Book a site visit',          te: 'సైట్ విజిట్ బుక్ చేయండి' },
  { en: 'Contact & Call',             te: 'సంప్రదించండి & కాల్' },
  { en: 'Available services',         te: 'అందుబాటులో ఉన్న సేవలు' },
  { en: 'Is it government approved?', te: 'ఇది ప్రభుత్వ ఆమోదం పొందిందా?' },
]

const WELCOME = {
  en: "👋 Hi! I'm the SDV Farms assistant. Ask me anything about our agricultural land marketplace — buying, selling, services, pricing, or how to book a visit!",
  te: "👋 నమస్కారం! నేను SDV ఫామ్స్ అసిస్టెంట్. మా వ్యవసాయ భూమి మార్కెట్‌ప్లేస్ గురించి ఏదైనా అడగండి!",
}

// Instant FAQ replies — no AI call needed
const FAQ_RULES = [
  {
    match: /\b(how many|propert|listings?|available land|browse)\b/i,
    reply: (count) =>
      `🌾 We have **${count} approved properties** listed across Telangana, Andhra Pradesh & Karnataka.\n\nBrowse and filter by state, soil type, area or price at [/properties](/properties) — no login needed!`,
  },
  {
    match: /\b(sell|list my land|seller|post land|add property|how to list)\b/i,
    reply: () =>
      `🌾 To list your land on SDV Farms:\n\n1. Register as a **Seller** at [/auth/register](/auth/register)\n2. Pass a quick eligibility check (Government/Poramboke land is not allowed)\n3. Fill our 3-step form — location, land details, upload Pahani/ROR-1B\n\nOnce submitted, our team reviews and approves it within 24 hours. Free listing — no commission!`,
  },
  {
    match: /\b(buy|purchase|buyer|looking for land|find land|invest)\b/i,
    reply: () =>
      `🏡 To buy agricultural land through SDV Farms:\n\n1. **Browse** listings at [/properties](/properties)\n2. **Filter** by state, soil type, area, or price\n3. **Book a site visit** directly on any property page\n4. Or submit a **land request** at [/buyer-request](/buyer-request) if you can't find what you need\n\nAll listings have clear title & government verification. Call **7780312525** for guidance.`,
  },
  {
    match: /\b(service|fencing|borewell|drip|irrigation|farming plan|plant|crop|farmhouse)\b/i,
    reply: () =>
      `🛠️ **SDV Farms — Phase II Services** (for land owners):\n\n• 🔒 Compound Fencing\n• ⚡ Borewell & Electricity connection\n• 💧 Drip Irrigation setup\n• 🌱 Customised Farming Plan\n• 🌳 Quality Plants (1-year replacement)\n\nAll services are on-demand. Call **7780312525** or visit [/services](/services) for details.`,
  },
  {
    match: /\b(contact|phone|call|whatsapp|email|reach|number|address|office)\b/i,
    reply: () =>
      `📞 **SDV Farms Contact Details:**\n\n• **Phone/WhatsApp:** 7780312525\n• **Email:** info@sdvfarms.in\n• **Office:** Hyderabad, Telangana\n• **Hours:** Mon–Sat, 9 AM – 6 PM\n\nOr fill the enquiry form on our home page — we'll call you back within 2 hours!`,
  },
  {
    match: /\b(price|cost|rate|per acre|how much|charge|fee|rupee|lakh|crore)\b/i,
    reply: () =>
      `💰 **Pricing at SDV Farms:**\n\nPrices vary by location, soil type, and land area. Each listing on [/properties](/properties) shows the price per acre and total cost.\n\nFor a personalised quote, call **7780312525** — we'll match you with the best options for your budget.`,
  },
  {
    match: /\b(location|where|address|near|hyderabad|telangana|andhra|karnataka|state|districts?|mandal)\b/i,
    reply: () =>
      `📍 **SDV Farms Properties are across:**\n\n• **Telangana** — Nalgonda, Yadadri, Suryapet, and more districts\n• **Andhra Pradesh** — multiple districts\n• **Karnataka** — selected districts\n\nAll well-connected to Hyderabad. Exact coordinates and map are on our home page. WhatsApp **7780312525** for driving directions.`,
  },
  {
    match: /\b(government|approved|legal|title|document|pahani|ror|adangal|rtc|verified)\b/i,
    reply: () =>
      `✅ **Yes — SDV Farms is 100% government-approved:**\n\n• Clear title with full legal verification\n• Registered sale deed directly in the buyer's name\n• All documents (Pahani/ROR-1B/Adangal/RTC) verified before listing\n• No hidden charges — transparent pricing\n\nCall **7780312525** to review documents before any commitment.`,
  },
  {
    match: /^(\?+|help|hi|hello|hey|namaste|నమస్కారం|హలో|ఏమి చేయగలరు)$/i,
    reply: () =>
      `👋 **Hi! Here's what I can help you with:**\n\n🏡 [Browse Properties](/properties) — filter by state, soil, area\n🌾 **Sell land** — register as a seller, free listing\n📅 **Book a site visit** — pick a date & slot on any property page\n🛠️ [Services](/services) — fencing, borewell, drip irrigation & more\n📞 **Call us** — 7780312525 (Mon–Sat, 9AM–6PM)\n\nJust type your question or tap one of the quick options below!`,
  },
  {
    match: /\b(appointment|site visit|visit|book|slot|schedule)\b/i,
    reply: () =>
      `📅 **Booking a site visit is easy:**\n\n1. Go to [/properties](/properties) and open any listing\n2. Click **"Book Site Visit"** on the property detail page\n3. Pick a date (within next 7 days) and time slot\n4. Pay ₹500 refundable token to confirm your slot\n\nOur team will call you before the visit. For immediate booking call **7780312525**.`,
  },
]

function matchFAQ(text, propertyCount) {
  for (const rule of FAQ_RULES) {
    if (rule.match.test(text)) {
      return rule.reply(propertyCount)
    }
  }
  return null
}

// Renders simple markdown: **bold**, [link](url), newlines
function ChatText({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-1" />
        // Parse **bold** and [text](url) in a line
        const parts = []
        const re = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g
        let last = 0, match
        while ((match = re.exec(line)) !== null) {
          if (match.index > last) parts.push(line.slice(last, match.index))
          if (match[0].startsWith('**')) {
            parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[2]}</strong>)
          } else {
            // Capture href and label NOW so the closure doesn't reference the
            // mutable `match` variable (which becomes null after the loop ends).
            const href  = match[4]
            const label = match[3]
            const idx   = match.index
            parts.push(
              <a key={idx} href={href}
                className="text-paddy-600 underline underline-offset-2 hover:text-paddy-800"
                onClick={e => { e.preventDefault(); window.location.href = href }}
              >{label}</a>
            )
          }
          last = match.index + match[0].length
        }
        if (last < line.length) parts.push(line.slice(last))
        return <p key={li}>{parts}</p>
      })}
    </div>
  )
}

// Quick action menu items shown before the full chat opens
const MENU_ACTIONS = [
  { icon: '🏡', en: 'Browse Properties',    te: 'ప్రాపర్టీలు చూడండి',       link: '/properties' },
  { icon: '🌾', en: 'Sell My Land',         te: 'నా భూమి అమ్మాలి',           link: '/auth/register' },
  { icon: '📅', en: 'Book a Site Visit',    te: 'సైట్ విజిట్ బుక్ చేయండి',   link: '/#contact' },
  { icon: '🛠️', en: 'Our Services',         te: 'మా సేవలు',                  link: '/services' },
  { icon: '📞', en: 'Call / WhatsApp',      te: 'కాల్ / వాట్సాప్',            link: 'tel:7780312525' },
  { icon: '💬', en: 'Chat with Assistant',  te: 'అసిస్టెంట్‌తో చాట్ చేయండి', action: 'chat' },
]

export default function ChatBot() {
  const router = useRouter()
  // mode: 'closed' | 'menu' | 'chat'
  const [mode, setMode]               = useState('closed')
  const [lang, setLang]               = useState('en')
  // Only true after React hydration — used to gate data-testid so Playwright
  // won't find/click the button before event handlers are attached
  const [mounted, setMounted]         = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [input, setInput]             = useState('')
  const [propertyCount, setPropertyCount] = useState(0)
  const [faqMessages, setFaqMessages] = useState([])
  const messagesEndRef                = useRef(null)
  const inputRef                      = useRef(null)

  const open = mode === 'chat'

  const { messages: aiMessages, sendMessage, status, error: aiError } = useChat({
    api: '/api/chat',
    initialMessages: [],
    onError: () => {
      injectFaqReply(
        '…',
        `⚠️ **AI assistant is temporarily unavailable** (quota limit reached).\n\nFor instant answers try the quick buttons below, or call us directly:\n📞 **7780312525** · Mon–Sat 9AM–6PM`,
      )
    },
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  // Combine welcome + faq + ai messages for display
  const welcomeMsg = {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: WELCOME[lang] }],
    content: WELCOME[lang],
  }
  const allMessages = [welcomeMsg, ...faqMessages, ...aiMessages]

  // Fetch approved property count once when menu or chat first opens
  useEffect(() => {
    if (mode === 'closed' || propertyCount > 0) return
    fetch('/api/property-count')
      .then(r => r.json())
      .then(d => setPropertyCount(d.count ?? 0))
      .catch(() => setPropertyCount(0))
  }, [open, propertyCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  useEffect(() => {
    if (mode === 'chat') setTimeout(() => inputRef.current?.focus(), 100)
  }, [mode])

  function injectFaqReply(userText, replyText) {
    const now = Date.now()
    setFaqMessages(prev => [
      ...prev,
      { id: `u-${now}`, role: 'user',      content: userText,  parts: [{ type: 'text', text: userText }] },
      { id: `a-${now}`, role: 'assistant', content: replyText, parts: [{ type: 'text', text: replyText }] },
    ])
  }

  const handleSubmit = e => {
    e.preventDefault()
    const text = input?.trim()
    if (!text || isLoading) return
    setInput('')
    const faq = matchFAQ(text, propertyCount)
    if (faq) {
      injectFaqReply(text, faq)
    } else {
      sendMessage({ text })
    }
  }

  const handleQuickQuestion = q => {
    if (q.link) {
      router.push(q.link)
      return
    }
    const text = lang === 'en' ? q.en : q.te
    const faq = matchFAQ(text, propertyCount)
    if (faq) {
      injectFaqReply(text, faq)
    } else {
      sendMessage({ text })
    }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
          data-testid="chat-window"
          className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-paddy-100"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-turmeric-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🌾</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">SDV Farms Assistant</p>
                <span className="flex items-center gap-1 text-paddy-300 text-xs">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(l => l === 'en' ? 'te' : 'en')}
                className="text-xs border border-white/30 text-white/80 rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors"
              >
                {lang === 'en' ? 'తెలుగు' : 'EN'}
              </button>
              <button
                onClick={() => setMode('menu')}
                title="Back to menu"
                className="text-white/70 hover:text-white transition-colors px-1"
              >
                ‹
              </button>
              <button onClick={() => setMode('closed')} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-cream px-4 py-3 space-y-3 min-h-0">
            {allMessages.map((m, i) => (
              <div key={m.id ?? i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  m.role === 'user' ? 'bg-paddy-600' : 'bg-turmeric-100 border border-turmeric-200'
                }`}>
                  {m.role === 'user'
                    ? <User size={13} className="text-white" />
                    : <span className="text-xs">🌾</span>}
                </div>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-paddy-700 text-white rounded-tr-sm'
                    : 'bg-white border border-turmeric-100 text-gray-800 rounded-tl-sm shadow-sm'
                }`}>
                  <ChatText text={m.parts ? m.parts.filter(p => p.type === 'text').map(p => p.text).join('') : m.content} />
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-turmeric-100 border border-turmeric-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">🌾</span>
                </div>
                <div className="bg-white border border-turmeric-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-paddy-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick questions — only at the start */}
            {allMessages.length <= 1 && !isLoading && (
              <div className="pt-1">
                <p className="text-xs text-gray-400 mb-2 text-center">Quick questions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className={`text-xs border rounded-full px-3 py-1.5 transition-colors ${
                        q.link
                          ? 'bg-turmeric-50 border-turmeric-300 text-turmeric-700 hover:bg-turmeric-100'
                          : 'bg-white border-turmeric-200 text-paddy-700 hover:bg-turmeric-50 hover:border-turmeric-400'
                      }`}
                    >
                      {lang === 'en' ? q.en : q.te}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0"
          >
            <input
              ref={inputRef}
              data-testid="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={lang === 'en' ? 'Ask anything about SDV Farms…' : 'SDV ఫామ్స్ గురించి అడగండి…'}
              className="flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-paddy-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input?.trim() || isLoading}
              className="w-9 h-9 bg-paddy-700 hover:bg-paddy-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* ── Quick action launcher menu ── */}
      {mode === 'menu' && (
        <div data-testid="chat-menu" className="fixed bottom-24 left-6 z-50 w-72 max-w-[calc(100vw-3rem)]">
          {/* Header card */}
          <div
            className="rounded-2xl shadow-xl overflow-hidden mb-2 border border-white/10"
            style={{ background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)' }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">SDV Farms</p>
                  <p className="text-paddy-300 text-xs">How can we help?</p>
                </div>
              </div>
              <button
                onClick={() => setMode('closed')}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 divide-y divide-gray-50">
            {MENU_ACTIONS.map((item, i) => (
              <button
                key={i}
                data-testid={`menu-action-${item.action ?? item.link?.replace(/[^a-z]/gi, '-') ?? i}`}
                onClick={() => {
                  if (item.action === 'chat') {
                    setMode('chat')
                  } else if (item.link?.startsWith('tel:')) {
                    window.location.href = item.link
                  } else if (item.link?.startsWith('/#')) {
                    setMode('closed')
                    router.push(item.link)
                  } else {
                    setMode('closed')
                    router.push(item.link)
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-turmeric-50 active:bg-turmeric-100 transition-colors group"
              >
                <span className="text-xl w-8 text-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <span className={`text-gray-800 text-sm font-medium flex-1 ${lang === 'te' ? 'telugu' : ''}`}>
                  {lang === 'en' ? item.en : item.te}
                </span>
                <span className="text-gray-300 group-hover:text-turmeric-400 transition-colors text-base">›</span>
              </button>
            ))}
          </div>

          {/* Language toggle */}
          <div className="mt-2 flex justify-center">
            <button
              onClick={() => setLang(l => l === 'en' ? 'te' : 'en')}
              className="text-xs text-white/70 bg-paddy-800/60 border border-white/20 rounded-full px-3 py-1 hover:bg-paddy-700/80 transition-colors"
            >
              {lang === 'en' ? 'తెలుగులో చూడండి' : 'View in English'}
            </button>
          </div>
        </div>
      )}

      {/* ── Floating toggle button ── */}
      <button
        onClick={() => setMode(m => m === 'closed' ? 'menu' : 'closed')}
        aria-label="Open SDV Farms assistant"
        data-testid={mounted ? 'chat-launcher' : undefined}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)' }}
      >
        {mode !== 'closed' ? (
          <X size={22} className="text-white" />
        ) : (
          <div className="relative">
            <MessageCircle size={24} className="text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-turmeric-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>
    </>
  )
}
