'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function StickyCTA({ href }: { href: string }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (dismissed || !visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#111111]/90 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
        <p className="text-sm text-[#a0a0a0]">
          <span className="font-semibold text-white">Protect your business</span> — Sign up free
        </p>
        <div className="flex items-center gap-2">
          <Link href={href} className="rounded bg-[#DC2626] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700">
            Get Started
          </Link>
          <button onClick={() => setDismissed(true)} className="p-1 text-[#6b7280] hover:text-white">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
