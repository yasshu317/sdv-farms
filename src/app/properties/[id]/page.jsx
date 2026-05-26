import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase-server'
import PropertyDetailClient from './PropertyDetailClient'

export const dynamic = 'force-dynamic'

export default async function PropertyDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch property and user session in parallel
  const [
    { data: property, error },
    { data: { user } },
  ] = await Promise.all([
    supabase.from('seller_properties').select('*').eq('id', id).eq('status', 'approved').single(),
    supabase.auth.getUser(),
  ])

  if (error || !property) redirect('/properties')

  const { views: _viewsStored, ...propertyForClient } = property

  // Increment view count (fire and forget) — don't expose counters on public PDP
  supabase.from('seller_properties').update({ views: (_viewsStored || 0) + 1 }).eq('id', id).then(() => {})

  // Check if wishlisted
  let wishlisted = false
  if (user) {
    const { data: wl } = await supabase
      .from('buyer_wishlist')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('property_id', id)
      .single()
    wishlisted = !!wl
  }

  const clientUser = user ? { id: user.id, email: user.email, ...user.user_metadata } : null

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#071709' }}>
        <span className="text-4xl animate-pulse">🌾</span>
      </div>
    }>
      <PropertyDetailClient property={propertyForClient} user={clientUser} initialWishlisted={wishlisted} />
    </Suspense>
  )
}
