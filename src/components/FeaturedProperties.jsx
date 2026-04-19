'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '../lib/supabase'
import { useLang } from '../context/LanguageContext'

function PropertyCard({ p }) {
  const photo = p.photo_urls?.[0]
  const totalPrice = (p.area_acres * p.expected_price).toLocaleString('en-IN')
  return (
    <Link
      href={`/properties/${p.id}`}
      className="group flex-shrink-0 w-72 sm:w-auto bg-white/5 hover:bg-white/8 border border-white/10 hover:border-turmeric-400/30 rounded-2xl overflow-hidden transition-all"
    >
      <div className="relative h-40 bg-paddy-900/40 overflow-hidden">
        {photo ? (
          <Image src={photo} alt="Property" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-5xl opacity-20">🌾</span>
          </div>
        )}
        {p.property_id && (
          <span className="absolute top-2 left-2 bg-black/60 text-turmeric-300 text-xs font-mono px-2 py-0.5 rounded-lg">
            {p.property_id}
          </span>
        )}
        <span className="absolute top-2 right-2 bg-green-600/80 text-white text-xs px-2 py-0.5 rounded-lg">
          Available
        </span>
      </div>
      <div className="p-4">
        <p className="text-white font-semibold text-sm mb-0.5">
          {[p.village, p.mandal].filter(Boolean).join(', ') || p.district}
        </p>
        <p className="text-white/45 text-xs mb-3">{[p.district, p.state].filter(Boolean).join(', ')}</p>
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-xs">{p.area_acres} acres · {p.land_soil_type} soil</span>
          <span className="text-turmeric-400 font-bold text-sm">₹{totalPrice}</span>
        </div>
        <p className="text-white/30 text-xs mt-0.5">₹{Number(p.expected_price).toLocaleString('en-IN')}/acre</p>
      </div>
    </Link>
  )
}

export default function FeaturedProperties() {
  const { lang } = useLang()
  const [properties, setProperties] = useState(null) // null = loading

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('seller_properties')
      .select('id, property_id, state, district, mandal, village, area_acres, expected_price, land_soil_type, photo_urls')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setProperties(data ?? []))
      .catch(() => setProperties([]))
  }, [])

  // Still loading
  if (properties === null) return null
  // No listings yet — show a gentle invite to sellers
  if (properties.length === 0) {
    return (
      <section className="py-14 px-4 sm:px-6 border-t border-white/6" style={{ background: '#0a1f0c' }}>
        <div className="max-w-5xl mx-auto text-center">
          <span className="bg-turmeric-500/15 border border-turmeric-400/25 text-turmeric-300 text-xs font-semibold px-3 py-1 rounded-full">
            Featured Properties
          </span>
          <h2 className="text-white font-display text-2xl font-bold mt-4 mb-3">
            {lang === 'en' ? 'Be the first to list your land' : 'మీ భూమిని మొదటగా జాబితా చేయండి'}
          </h2>
          <p className="text-white/45 text-sm mb-6 max-w-md mx-auto">
            {lang === 'en'
              ? 'No listings yet — register as a seller and post your agricultural land in minutes. Free, fast, and government-verified.'
              : 'ఇంకా జాబితాలు లేవు — విక్రేతగా నమోదు చేసుకుని మీ భూమిని నిమిషాల్లో పోస్ట్ చేయండి.'}
          </p>
          <Link href="/auth/register" className="btn-gold px-6 py-2.5 text-sm rounded-xl">
            {lang === 'en' ? 'List Your Land →' : 'మీ భూమి జాబితా చేయండి →'}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="py-14 px-4 sm:px-6 border-t border-white/6" style={{ background: '#0a1f0c' }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="bg-turmeric-500/15 border border-turmeric-400/25 text-turmeric-300 text-xs font-semibold px-3 py-1 rounded-full">
              Featured Properties
            </span>
            <h2 className={`text-white font-display text-2xl sm:text-3xl font-bold mt-3 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'en' ? 'Latest Listings' : 'తాజా జాబితాలు'}
            </h2>
          </div>
          <Link href="/properties" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium transition-colors whitespace-nowrap">
            View All →
          </Link>
        </div>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {properties.map(p => <PropertyCard key={p.id} p={p} />)}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/buyer-request"
            className="text-white/35 hover:text-white/60 text-sm transition-colors"
          >
            {lang === 'en' ? "Can't find the right land? Post a request →" : 'సరైన భూమి కనుగొనలేదా? అభ్యర్థన పోస్ట్ చేయండి →'}
          </Link>
        </div>
      </div>
    </section>
  )
}
