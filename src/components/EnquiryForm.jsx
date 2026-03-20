import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

// Replace these with your actual EmailJS credentials after sign-up at emailjs.com
const EMAILJS_SERVICE_ID = 'service_sdvfarms'
const EMAILJS_TEMPLATE_ID = 'template_sdvfarms'
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'

export default function EnquiryForm() {
  const { lang } = useLang()
  const t = content[lang].enquiry

  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

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
      <section id="contact" className="py-20 bg-forest-800">
        <div className="max-w-xl mx-auto px-4 text-center">
          <CheckCircle size={56} className="text-gold-400 mx-auto mb-4" />
          <h3 className={`text-2xl font-bold text-white mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
            {t.successTitle}
          </h3>
          <p className={`text-forest-200 ${lang === 'te' ? 'telugu' : ''}`}>{t.successMsg}</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 btn-gold"
          >
            {lang === 'en' ? 'Send Another' : 'మరొకటి పంపండి'}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 bg-forest-800">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className={`text-3xl md:text-4xl font-bold text-white mb-3 ${lang === 'te' ? 'telugu' : ''}`}>
            {t.heading}
          </h2>
          <p className={`text-forest-200 ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder={t.namePlaceholder}
              className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              type="tel"
              placeholder={t.phonePlaceholder}
              className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
            />
          </div>

          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            placeholder={t.emailPlaceholder}
            className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors ${lang === 'te' ? 'telugu' : ''}`}
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            placeholder={t.messagePlaceholder}
            className={`w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold-400 transition-colors resize-none ${lang === 'te' ? 'telugu' : ''}`}
          />

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-300 text-sm">
              <AlertCircle size={16} />
              <span className={lang === 'te' ? 'telugu' : ''}>{t.errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send size={18} />
            <span className={lang === 'te' ? 'telugu' : ''}>
              {status === 'sending' ? t.sending : t.submit}
            </span>
          </button>
        </form>
      </div>
    </section>
  )
}
