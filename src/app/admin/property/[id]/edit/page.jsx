'use client'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '../../../../../lib/supabase'
import AdminPropertyForm from '../../../../../components/admin/AdminPropertyForm'
import { mapSellerPropertyRowToForm } from '../../../../seller/property/propertyFormConstants'

export default function AdminEditPropertyPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [blocked, setBlocked] = useState(null)
  const [initialForm, setInitialForm] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.user_metadata?.role !== 'admin') {
        setBlocked('Admin access required.')
        setLoading(false)
        return
      }
      const { data: row, error } = await supabase.from('seller_properties').select('*').eq('id', id).maybeSingle()
      if (cancelled) return
      if (error || !row) {
        setBlocked('Listing not found.')
        setLoading(false)
        return
      }
      setInitialForm(mapSellerPropertyRowToForm(row))
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-sm mb-4">{blocked}</p>
          <Link href="/admin" className="text-paddy-700 text-sm font-medium hover:underline">
            ← Admin
          </Link>
        </div>
      </div>
    )
  }

  return <AdminPropertyForm mode="edit" propertyId={id} initialForm={initialForm} />
}
