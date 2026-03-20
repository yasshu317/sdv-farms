'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'

const QUICK_QUESTIONS = [
  { en: 'What is SDV Farms?',         te: 'SDV ఫామ్స్ అంటే ఏమిటి?' },
  { en: 'How to book a site visit?',  te: 'సైట్ విజిట్ ఎలా బుక్ చేయాలి?' },
  { en: 'Where is it located?',       te: 'ఇది ఎక్కడ ఉంది?' },
  { en: 'Is it government approved?', te: 'ఇది ప్రభుత్వ ఆమోదం పొందిందా?' },
]

const WELCOME = {
  en: "👋 Hi! I'm the SDV Farms assistant. Ask me anything about our agricultural land project near Hyderabad — plots, pricing, legal process, or how to book a visit!",
  te: "👋 నమస్కారం! నేను SDV ఫామ్స్ అసిస్టెంట్. హైదరాబాద్ సమీపంలోని మా వ్యవసాయ భూమి ప్రాజెక్ట్ గురించి ఏదైనా అడగండి!",
}

export default function ChatBot() {
  const [open, setOpen]   = useState(false)
  const [lang, setLang]   = useState('en')
  const [input, setInput] = useState('')
  const messagesEndRef    = useRef(null)
  const inputRef          = useRef(null)

  const { messages, sendMessage, status } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: WELCOME[lang],
        parts: [{ type: 'text', text: WELCOME[lang] }],
      },
    ],
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const handleSubmit = e => {
    e.preventDefault()
    const text = input?.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setInput('')
  }

  const handleQuickQuestion = q => {
    const text = lang === 'en' ? q.en : q.te
    sendMessage({ text })
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div
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
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-cream px-4 py-3 space-y-3 min-h-0">
            {messages.map((m, i) => (
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
                  {m.parts
                    ? m.parts.filter(p => p.type === 'text').map(p => p.text).join('')
                    : m.content}
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
            {messages.length <= 1 && !isLoading && (
              <div className="pt-1">
                <p className="text-xs text-gray-400 mb-2 text-center">Quick questions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      className="text-xs bg-white border border-turmeric-200 text-paddy-700 rounded-full px-3 py-1.5 hover:bg-turmeric-50 hover:border-turmeric-400 transition-colors"
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

      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open chat assistant"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a4520 0%, #286d2f 100%)' }}
      >
        {open ? (
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
