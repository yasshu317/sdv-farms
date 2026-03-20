import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Send, CheckCircle, AlertCircle, Phone } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export default function EnquiryForm() {
  const { lang } = useLang()
  const t = content[lang].enquiry

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setStatus('sending')
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_phone: form.phone,
          from_email: form.email || 'Not provided',
          message: form.message || 'No message provided',
          to_email: 'info@sdvfarms.in',
        },
        EMAILJS_PUBLIC_KEY
      )
      setStatus('success')
      setForm({ name: '', phone: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section id="contact" className="relative py-20 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #5c3a1e 0%, #3d2010 100%)' }}
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-turmeric-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-turmeric-400" />
          </div>
          <h3 className={`font-display text-2xl font-bold text-white mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
            {t.successTitle}
          </h3>
          <p className={`text-turmeric-200/70 ${lang === 'te' ? 'telugu' : ''}`}>{t.successMsg}</p>
          <button onClick={() => setStatus('idle')} className="mt-6 btn-gold">
            {lang === 'en' ? 'Send Another Enquiry' : 'మరొక విచారణ పంపండి'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      className="relative py-20 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #5c3a1e 0%, #3d2010 60%, #1a0e07 100%)' }}
    >
      {/* Turmeric dot grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,160,23,0.5) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Glow blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-turmeric-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-terracotta-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-turmeric-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Book a Visit
          </span>
          <h2 className={`font-display text-3xl md:text-4xl font-bold text-white mb-3 ${lang === 'te' ? 'telugu' : ''}`}>
            {t.heading}
          </h2>
          <div className="gold-divider" />
          <p className={`text-turmeric-200/60 -mt-4 ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>
        </div>

        {/* Quick call CTA */}
        <a
          href="tel:7780312525"
          className="flex items-center justify-center gap-3 bg-turmeric-500/10 border border-turmeric-400/30 hover:bg-turmeric-500/20 text-white rounded-2xl py-4 px-6 mb-6 transition-colors"
        >
          <div className="w-9 h-9 bg-turmeric-500/20 rounded-full flex items-center justify-center">
            <Phone size={16} className="text-turmeric-400" />
          </div>
          <div className="text-left">
            <p className="text-xs text-turmeric-300 font-medium">Prefer to talk? Call directly</p>
            <p className="text-white font-bold tracking-wider">+91 7780312525</p>
          </div>
        </a>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-turmeric-300/70 text-xs font-medium mb-1.5 ${lang === 'te' ? 'telugu' : ''}`}>
                {lang === 'en' ? 'Full Name *' : 'పూర్తి పేరు *'}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder={t.namePlaceholder}
                className={`w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-turmeric-400 focus:bg-white/12 transition-all ${lang === 'te' ? 'telugu' : ''}`}
              />
            </div>
            <div>
              <label className={`block text-turmeric-300/70 text-xs font-medium mb-1.5 ${lang === 'te' ? 'telugu' : ''}`}>
                {lang === 'en' ? 'Phone Number *' : 'ఫోన్ నంబర్ *'}
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                type="tel"
                placeholder={t.phonePlaceholder}
                className={`w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-turmeric-400 focus:bg-white/12 transition-all ${lang === 'te' ? 'telugu' : ''}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-turmeric-300/70 text-xs font-medium mb-1.5 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'en' ? 'Email (optional)' : 'ఇమెయిల్ (ఐచ్ఛికం)'}
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder={t.emailPlaceholder}
              className={`w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-turmeric-400 focus:bg-white/12 transition-all ${lang === 'te' ? 'telugu' : ''}`}
            />
          </div>

          <div>
            <label className={`block text-turmeric-300/70 text-xs font-medium mb-1.5 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'en' ? 'Message / Preferred Visit Date' : 'సందేశం / ప్రాధాన్య సందర్శన తేదీ'}
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={4}
              placeholder={t.messagePlaceholder}
              className={`w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-turmeric-400 focus:bg-white/12 transition-all resize-none ${lang === 'te' ? 'telugu' : ''}`}
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 rounded-xl px-4 py-3">
              <AlertCircle size={16} />
              <span className={lang === 'te' ? 'telugu' : ''}>{t.errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-gold w-full gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send size={17} />
            <span className={lang === 'te' ? 'telugu' : ''}>
              {status === 'sending' ? t.sending : t.submit}
            </span>
          </button>
        </form>
      </div>

      {/* Wave */}
      <div className="wave-bottom">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C360,70 1080,0 1440,45 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  )
}
