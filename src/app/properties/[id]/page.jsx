import { redirect } from 'next/navigation'
import { createClient } from '../../../lib/supabase-server'
import PropertyDetailClient from './PropertyDetailClient'

export const dynamic = 'force-dynamic'

export default async function PropertyDetailPage({ params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('seller_properties')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (error || !property) redirect('/properties')

  // Increment view count (fire and forget)
  supabase.from('seller_properties').update({ views: (property.views || 0) + 1 }).eq('id', id).then(() => {})

  const { data: { user } } = await supabase.auth.getUser()

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

  return (
    <PropertyDetailClient
      property={property}
      user={user ? { id: user.id, email: user.email, ...user.user_metadata } : null}
      initialWishlisted={wishlisted}
    />
  )
}
