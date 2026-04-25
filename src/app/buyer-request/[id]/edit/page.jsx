'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../lib/supabase'
import BuyerLandRequestForm, {
  mapBuyerRequestRowToForm,
} from '../../../../components/buyer/BuyerLandRequestForm'

const bg = 'linear-gradient(160deg, #071709 0%, #1a4520 60%, #286d2f 100%)'

export default function EditBuyerRequestPage() {
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
      const { data: row, error } = await supabase.from('buyer_requests').select('*').eq('id', id).maybeSingle()
      if (cancelled) return
      if (error || !row) {
        setBlocked('Request not found.')
        setLoading(false)
        return
      }
      if (row.buyer_id !== user.id) {
        setBlocked('You can only edit your own land requests.')
        setLoading(false)
        return
      }
      if (row.status !== 'open') {
        setBlocked('Only open requests can be edited. Contact SDV Farms for changes.')
        setLoading(false)
        return
      }
      setInitialForm(mapBuyerRequestRowToForm(row))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, router])

  async function handleSave(form) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Please sign in')

    const { data, error } = await supabase
      .from('buyer_requests')
      .update({
        name: form.name,
        phone: form.phone,
        email: form.email || user.email || null,
        state: form.state || null,
        district: form.district || null,
        mandal: form.mandal || null,
        land_soil_type: form.land_soil_type || null,
        area_min: form.area_min ? Number(form.area_min) : null,
        area_max: form.area_max ? Number(form.area_max) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        notes: form.notes || null,
      })
      .eq('id', id)
      .eq('buyer_id', user.id)
      .eq('status', 'open')
      .select('id')

    if (error) throw new Error(error.message)
    if (!data?.length) throw new Error('Could not save — request may no longer be open.')
    router.push('/dashboard?tab=land-requests')
    router.refresh()
  }

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
          <Link href="/dashboard" className="text-turmeric-400 hover:text-turmeric-300 text-sm font-medium">
            ← Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: bg }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="text-white/50 hover:text-white/70 text-sm transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-white font-display text-2xl font-bold mt-3">Edit land request</h1>
          <p className="text-white/50 text-sm mt-1">You can update while status is Open</p>
        </div>

        <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-3xl p-8">
          <BuyerLandRequestForm
            key={id}
            initialForm={initialForm}
            submitLabel="Save changes"
            onSubmit={handleSave}
          />
        </div>
      </div>
    </div>
  )
}
