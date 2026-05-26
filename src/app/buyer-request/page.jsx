'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import SiteHeader from '../../components/SiteHeader'
import { createClient } from '../../lib/supabase'
import BuyerLandRequestForm from '../../components/buyer/BuyerLandRequestForm'
import { useLang } from '../../context/LanguageContext'
import { content } from '../../data/content'

const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

export default function BuyerRequestPage() {
  const router = useRouter()
  const { lang } = useLang()
  const nav = content[lang].nav
  const ctaBrowse = content[lang].cta.viewProperties
  const [success, setSuccess] = useState(false)
  const [betaEnabled, setBetaEnabled] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard')
    })
  }, [router])

  useEffect(() => {
    fetch('/api/feature-flags')
      .then(r => r.json())
      .then(j => setBetaEnabled(!!j?.flags?.buyer_land_request_beta?.enabled))
      .catch(() => {})
  }, [])

  async function handleCreate(form) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertErr } = await supabase.from('buyer_requests').insert({
      buyer_id: user?.id || null,
      name: form.name,
      phone: form.phone,
      email: form.email || user?.email || null,
      state: form.state || null,
      district: form.district || null,
      mandal: form.mandal || null,
      land_soil_type: form.land_soil_type || null,
      area_min: form.area_min ? Number(form.area_min) : null,
      area_max: form.area_max ? Number(form.area_max) : null,
      price_max: form.price_max ? Number(form.price_max) : null,
      notes: form.notes || null,
      buyer_residence_city: form.buyer_residence_city || null,
      buyer_residence_state: form.buyer_residence_state || null,
      buyer_residence_notes: form.buyer_residence_notes || null,
    })

    if (insertErr) throw new Error(insertErr.message)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: bg }}>
        <SiteHeader active="buyer-request" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🌾</div>
          <h2 className="text-white font-display text-2xl font-bold mb-3">Request Submitted!</h2>
          <p className="text-white/60 mb-6">
            Our team will review your requirements and get back to you within 48 hours.
          </p>
          <Link
            href="/properties"
            className="inline-block bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {ctaBrowse} →
          </Link>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: bg }}>
      <SiteHeader active="buyer-request" />
      <div className="px-4 py-8 sm:py-12">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <span className="mx-1.5">·</span>
            <Link href="/properties" className="hover:text-white/60 transition-colors">{nav.properties}</Link>
            <span className="mx-1.5">·</span>
            <span className="text-white/55">Request</span>
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <h1 className="text-white font-display text-2xl font-bold">Post a Land Request</h1>
            {betaEnabled && (
              <span className="inline-flex items-center gap-1 bg-turmeric-500/20 border border-turmeric-400/40 text-turmeric-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Beta
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm mt-1">Tell us what you&apos;re looking for — we&apos;ll find a match</p>
          {betaEnabled && (
            <p className="mt-2 text-turmeric-400/70 text-xs bg-turmeric-500/10 border border-turmeric-400/20 rounded-xl px-4 py-2 inline-block">
              You are seeing an early preview of new features on this page.
            </p>
          )}
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
          <BuyerLandRequestForm submitLabel="Submit Request" onSubmit={handleCreate} />
        </div>
      </div>
      </div>
    </div>
  )
}
