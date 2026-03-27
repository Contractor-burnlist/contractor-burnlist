'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function Banner() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success') === 'true'

  if (!success) return null

  return (
    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🎉</span>
        <div>
          <p className="font-semibold text-green-800">Welcome to Contractor Burnlist!</p>
          <p className="text-sm text-green-700">Your subscription is now active.</p>
        </div>
      </div>
    </div>
  )
}

export default function SuccessBanner() {
  return (
    <Suspense fallback={null}>
      <Banner />
    </Suspense>
  )
}
