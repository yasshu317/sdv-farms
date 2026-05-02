'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function Banner() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('redirected') === '1') setShow(true)
  }, [searchParams])

  if (!show) return null

  return (
    <div className="bg-turmeric-500/15 border border-turmeric-400/30 text-turmeric-200 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
      <span className="mt-0.5 shrink-0">ℹ️</span>
      <span>
        You were redirected to your dashboard because that page is not available for your account type.
        If you think this is wrong,{' '}
        <a href="mailto:info@sdvfarms.in" className="underline hover:text-turmeric-100">contact us</a>.
      </span>
    </div>
  )
}

export default function RoleRedirectBanner() {
  return (
    <Suspense fallback={null}>
      <Banner />
    </Suspense>
  )
}
