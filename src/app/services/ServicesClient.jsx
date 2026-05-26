'use client'
import Link from 'next/link'
import SiteHeader from '../../components/SiteHeader'
import Phase2ServicesPanel from '../../components/services/Phase2ServicesPanel'
import { useLang } from '../../context/LanguageContext'
import { content } from '../../data/content'

export default function ServicesClient() {
  const { lang } = useLang()
  const t = content[lang].services

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      <SiteHeader active="services" />

      <div className="border-b border-white/8 px-4 sm:px-6 py-10 sm:py-12 text-center">
        <p className="text-white/40 text-xs mb-3">
          <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
          <span className="mx-1.5">·</span>
          <span className="text-white/55">Services</span>
        </p>
        <h1 className="text-white font-display text-3xl sm:text-4xl font-bold mt-0 mb-3">{t.heading}</h1>
        <p className={`text-white/60 max-w-xl mx-auto ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>
        <p className="text-white/35 text-[11px] mt-4">
          Signed in? You can book the same services under{' '}
          <Link href="/dashboard" className="text-turmeric-400/90 hover:text-turmeric-300 font-medium">
            My Dashboard →
          </Link>
          {' '}(your details pre-filled).
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <Phase2ServicesPanel
          prefillContact={null}
          showPhase3Teaser
          footerLinkHref={null}
          footerLinkLabel=""
        />
      </div>
    </div>
  )
}
