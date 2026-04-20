'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../../lib/supabase'
import SellerPropertyForm from '../../../../../components/seller/SellerPropertyForm'
import { mapSellerPropertyRowToForm } from '../../propertyFormConstants'

const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

export default function EditSellerPropertyPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(null)
  const [initialForm, setInitialForm] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/auth/login')
        return
      }
      const { data: row, error } = await supabase.from('seller_properties').select('*').eq('id', id).maybeSingle()
      if (cancelled) return
      if (error || !row) {
        setBlocked('Listing not found.')
        setLoading(false)
        return
      }
      if (row.seller_id !== user.id) {
        setBlocked('You can only edit your own listings.')
        setLoading(false)
        return
      }
      if (row.status !== 'pending') {
        setBlocked('Only listings that are still pending review can be edited.')
        setLoading(false)
        return
      }
      setInitialForm(mapSellerPropertyRowToForm(row))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [id, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <p className="text-white/60 text-sm">Loading…</p>
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: bg }}>
        <div className="text-center max-w-md">
          <p className="text-red-300 text-sm mb-4">{blocked}</p>
          <Link href="/seller" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium">
            ← Back to My Listings
          </Link>
        </div>
      </div>
    )
  }

  return <SellerPropertyForm variant="edit" propertyId={id} initialForm={initialForm} />
}
