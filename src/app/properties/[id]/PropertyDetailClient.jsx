'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import SiteHeader from '../../../components/SiteHeader'
import { createClient } from '../../../lib/supabase'
import StatusBadge from '../../../components/ui/StatusBadge'
import AppointmentPicker from '../../../components/AppointmentPicker'

export default function PropertyDetailClient({ property: p, user, initialWishlisted }) {
  const router = useRouter()
  const [wishlisted, setWishlisted]       = useState(initialWishlisted)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [showPicker, setShowPicker]       = useState(false)
  const [activePhoto, setActivePhoto]     = useState(0)

  const photos = p.photo_urls?.filter(Boolean) || []
  const totalPrice = (p.area_acres * p.expected_price).toLocaleString('en-IN')
  const accountRole = (user?.role || 'buyer').toLowerCase()
  const isOwner     = user && p.seller_id === user.id

  async function handleWishlist() {
    if (!user) { router.push('/auth/login'); return }
    if (isOwner) return
    setWishlistLoading(true)
    const supabase = createClient()

    if (wishlisted) {
      await supabase.from('buyer_wishlist')
        .delete()
        .eq('buyer_id', user.id)
        .eq('property_id', p.id)
      setWishlisted(false)
    } else {
      const { count } = await supabase
        .from('buyer_wishlist')
        .select('id', { count: 'exact', head: true })
        .eq('buyer_id', user.id)
      if (count >= 2) {
        alert('You can save up to 2 properties. Remove one to add this.')
        setWishlistLoading(false)
        return
      }
      await supabase.from('buyer_wishlist').insert({ buyer_id: user.id, property_id: p.id })
      setWishlisted(true)
    }
    setWishlistLoading(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #071709 0%, #0e2c13 50%, #071709 100%)' }}>
      <SiteHeader active="properties" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <nav className="text-white/45 text-xs mb-4" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white/70 transition-colors">Home</Link>
          <span className="mx-1.5">·</span>
          <Link href="/properties" className="hover:text-white/70 transition-colors">Listings</Link>
          <span className="mx-1.5">·</span>
          <span className="text-white/60">{p.property_id || 'Property'}</span>
        </nav>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Photos + Details */}
          <div className="lg:col-span-3">
            {/* Main photo */}
            <div className="relative h-64 sm:h-80 bg-paddy-900/40 rounded-2xl overflow-hidden mb-3">
              {photos.length > 0 ? (
                <Image src={photos[activePhoto]} alt="Property" fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-6xl opacity-20">🌾</span>
                </div>
              )}
              {p.property_id && (
                <span className="absolute top-3 left-3 bg-black/60 text-turmeric-300 font-mono text-sm px-3 py-1 rounded-xl">
                  {p.property_id}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {photos.map((ph, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === activePhoto ? 'border-turmeric-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <Image src={ph} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Property details */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h1 className="text-white font-display text-xl font-bold mb-1">
                {[p.village, p.mandal].filter(Boolean).join(', ')}
              </h1>
              <p className="text-white/50 text-sm mb-4">
                {[p.district, p.state].filter(Boolean).join(', ')}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Area',        value: `${p.area_acres} acres` },
                  { label: 'Soil Type',   value: p.land_soil_type || '—' },
                  { label: 'Land Type',   value: p.land_used_type || '—' },
                  { label: 'Road Access', value: p.road_access ? 'Yes' : 'No' },
                  { label: 'Doc Type',    value: p.land_doc_type || '—' },
                  { label: 'Views',       value: p.views || 0 },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3">
                    <p className="text-white/40 text-xs mb-0.5">{item.label}</p>
                    <p className="text-white text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Pricing + Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6">
              {user && (
                <p className="text-white/45 text-xs mb-4">
                  <span className="text-white/60">You’re signed in</span>
                  {' · '}
                  <span className="text-turmeric-400/90 capitalize">{accountRole}</span>
                  {isOwner && (
                    <span className="block mt-1.5 text-turmeric-300/95 font-medium">This listing is yours (seller view)</span>
                  )}
                </p>
              )}

              <div className="mb-5">
                <p className="text-white/50 text-xs mb-1">Total Price</p>
                <p className="text-turmeric-400 font-bold text-3xl">₹{totalPrice}</p>
                <p className="text-white/40 text-sm mt-0.5">₹{Number(p.expected_price).toLocaleString('en-IN')} per acre</p>
              </div>

              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-white/45 text-sm leading-relaxed">
                    <strong className="text-white/80">Book a site visit</strong> is for <strong>buyers</strong> who want to see the land. Share this page with buyers, or open your listing to edit.
                  </p>
                  <Link
                    href={`/seller/property/${p.id}/edit`}
                    className="block w-full text-center bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Edit this listing
                  </Link>
                  <Link
                    href="/seller"
                    className="block w-full text-center bg-white/10 hover:bg-white/15 text-white font-medium py-3 rounded-xl border border-white/15 transition-colors"
                  >
                    Seller dashboard
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-white/40 text-xs mb-3 leading-relaxed">
                    <strong className="text-white/60">For buyers:</strong> book a time to visit this land. SDV Farms coordinates with the listing owner and confirms with you.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => { if (!user) router.push('/auth/login'); else setShowPicker(s => !s) }}
                      className="w-full bg-turmeric-500 hover:bg-turmeric-600 text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      📅 Book a Site Visit
                    </button>
                    <button
                      onClick={handleWishlist}
                      disabled={wishlistLoading}
                      className={`w-full py-3 rounded-xl font-medium transition-all ${
                        wishlisted
                          ? 'bg-paddy-500/20 border border-paddy-400/40 text-paddy-300'
                          : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                      }`}
                    >
                      {wishlisted ? '♥ Saved' : '♡ Save Property'}
                    </button>
                  </div>

                  {!user && (
                    <p className="text-white/30 text-xs text-center mt-3">
                      <Link href="/auth/login" className="text-turmeric-400 hover:text-turmeric-300">Sign in</Link> to save or book
                    </p>
                  )}

                  {showPicker && user && (
                    <div className="mt-5 pt-5 border-t border-white/10">
                      <AppointmentPicker
                        propertyId={p.id}
                        type="buyer"
                        userEmail={user?.email}
                        onBooked={() => setShowPicker(false)}
                        onCancel={() => setShowPicker(false)}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="mt-5 pt-4 border-t border-white/8 text-center">
                <p className="text-white/30 text-xs mb-2">Have questions?</p>
                <a
                  href={`https://wa.me/917780312525?text=Hi, I'm interested in property ${p.property_id || p.id}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-paddy-400 hover:text-paddy-300 text-sm font-medium transition-colors"
                >
                  💬 WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
