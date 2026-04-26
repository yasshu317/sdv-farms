'use client'
import { useState } from 'react'
import Link from 'next/link'
import SiteHeader from '../../components/SiteHeader'
import { createClient } from '../../lib/supabase'
import BuyerLandRequestForm from '../../components/buyer/BuyerLandRequestForm'

const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

export default function BuyerRequestPage() {
  const [success, setSuccess] = useState(false)

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
            Browse Available Properties →
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
            <Link href="/properties" className="hover:text-white/60 transition-colors">Listings</Link>
            <span className="mx-1.5">·</span>
            <span className="text-white/55">Request</span>
          </p>
          <h1 className="text-white font-display text-2xl font-bold mt-3">Post a Land Request</h1>
          <p className="text-white/50 text-sm mt-1">Tell us what you&apos;re looking for — we&apos;ll find a match</p>
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
          <BuyerLandRequestForm submitLabel="Submit Request" onSubmit={handleCreate} />
        </div>
      </div>
      </div>
    </div>
  )
}
