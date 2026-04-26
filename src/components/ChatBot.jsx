'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { content } from '../data/content.js'
import { matchFAQ } from '../lib/chatbotFaq.js'
import { useLang } from '../context/LanguageContext'

// Renders simple markdown: **bold**, [link](url), newlines
function ChatText({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-1" />
        const parts = []
        const re = /(\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\))/g
        let last = 0
        let match
        while ((match = re.exec(line)) !== null) {
          if (match.index > last) parts.push(line.slice(last, match.index))
          if (match[0].startsWith('**')) {
            parts.push(<strong key={match.index} className="font-semibold text-gray-900">{match[2]}</strong>)
          } else {
            const href = match[4]
            const label = match[3]
            const idx = match.index
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

export default function ChatBot() {
  const router = useRouter()
  const { lang, toggle } = useLang()
  const c = content[lang].chatbot

  const [mode, setMode]               = useState('closed')
  const [mounted, setMounted]         = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const [input, setInput]             = useState('')
  const [propertyCount, setPropertyCount] = useState(0)
  const [threadMessages, setThreadMessages] = useState([])
  const messagesEndRef                = useRef(null)
  const inputRef                      = useRef(null)

  const welcomeMsg = {
    id: 'welcome',
    role: 'assistant',
    parts: [{ type: 'text', text: c.welcome }],
    content: c.welcome,
  }
  const allMessages = [welcomeMsg, ...threadMessages]

  useEffect(() => {
    if (mode === 'closed' || propertyCount > 0) return
    fetch('/api/property-count')
      .then(r => r.json())
      .then(d => setPropertyCount(d.count ?? 0))
      .catch(() => setPropertyCount(0))
  }, [mode, propertyCount])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [allMessages])

  useEffect(() => {
    if (mode === 'chat') setTimeout(() => inputRef.current?.focus(), 100)
  }, [mode])

  function injectReply(userText, replyText) {
    const now = Date.now()
    setThreadMessages(prev => [
      ...prev,
      { id: `u-${now}`, role: 'user',      content: userText,  parts: [{ type: 'text', text: userText }] },
      { id: `a-${now}`, role: 'assistant', content: replyText, parts: [{ type: 'text', text: replyText }] },
    ])
  }

  const handleSubmit = e => {
    e.preventDefault()
    const text = input?.trim()
    if (!text) return
    setInput('')
    const faq = matchFAQ(text, lang, propertyCount)
    injectReply(text, faq ?? c.fallback)
  }

  const handleQuickQuestion = q => {
    if (q.link) {
      router.push(q.link)
      return
    }
    const faq = matchFAQ(q.label, lang, propertyCount)
    injectReply(q.label, faq ?? c.fallback)
  }

  return (
    <>
      {mode === 'chat' && (
        <div
          data-testid="chat-window"
          className="fixed bottom-24 left-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-paddy-100"
          style={{ height: '520px' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-turmeric-500/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🌾</span>
              </div>
              <div>
                <p className={`text-white font-semibold text-sm leading-tight ${lang === 'te' ? 'telugu' : ''}`}>{c.assistantTitle}</p>
                <span className={`flex items-center gap-1 text-paddy-300 text-xs ${lang === 'te' ? 'telugu' : ''}`}>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  {c.online}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggle}
                className="text-xs border border-white/30 text-white/80 rounded-full px-2.5 py-1 hover:bg-white/10 transition-colors"
              >
                {lang === 'en' ? c.toggleToTelugu : c.toggleToEnglish}
              </button>
              <button
                type="button"
                onClick={() => setMode('menu')}
                title={c.backToMenuTitle}
                className="text-white/70 hover:text-white transition-colors px-1"
              >
                ‹
              </button>
              <button type="button" onClick={() => setMode('closed')} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-y-auto bg-cream px-4 py-3 space-y-3 min-h-0 ${lang === 'te' ? 'telugu' : ''}`}>
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

            <div className="pt-2 border-t border-turmeric-100/60 mt-2">
              <p className="text-xs text-gray-400 mb-2 text-center">{c.quickQuestionsLabel}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {c.quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickQuestion(q)}
                    className={`text-xs border rounded-full px-3 py-1.5 transition-colors ${
                      q.link
                        ? 'bg-turmeric-50 border-turmeric-300 text-turmeric-700 hover:bg-turmeric-100'
                        : 'bg-white border-turmeric-200 text-paddy-700 hover:bg-turmeric-50 hover:border-turmeric-400'
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0"
          >
            <input
              ref={inputRef}
              data-testid="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={c.inputPlaceholder}
              className={`flex-1 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-paddy-500 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
            />
            <button
              type="submit"
              disabled={!input?.trim()}
              className="w-9 h-9 bg-paddy-700 hover:bg-paddy-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {mode === 'menu' && (
        <div data-testid="chat-menu" className="fixed bottom-24 left-6 z-50 w-72 max-w-[calc(100vw-3rem)]">
          <div
            className="rounded-2xl shadow-xl overflow-hidden mb-2 border border-white/10"
            style={{ background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)' }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌾</span>
                <div>
                  <p className={`text-white font-semibold text-sm leading-tight ${lang === 'te' ? 'telugu' : ''}`}>{c.menuBrand}</p>
                  <p className={`text-paddy-300 text-xs ${lang === 'te' ? 'telugu' : ''}`}>{c.menuHelpSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMode('closed')}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 divide-y divide-gray-50">
            {c.menuActions.map((item, i) => (
              <button
                key={i}
                type="button"
                data-testid={
                  item.link === '/properties'
                    ? 'menu-browse-properties'
                    : `menu-action-${item.action ?? item.link?.replace(/[^a-z]/gi, '-') ?? i}`
                }
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
                  {item.label}
                </span>
                <span className="text-gray-300 group-hover:text-turmeric-400 transition-colors text-base">›</span>
              </button>
            ))}
          </div>

          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={toggle}
              className={`text-xs text-white/70 bg-paddy-800/60 border border-white/20 rounded-full px-3 py-1 hover:bg-paddy-700/80 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
            >
              {lang === 'en' ? c.menuViewTelugu : c.menuViewEnglish}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setMode(m => m === 'closed' ? 'menu' : 'closed')}
        aria-label={c.launcherAria}
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
