'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import ReputationBadge from '@/components/ReputationBadge'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [repPoints, setRepPoints] = useState(0)
  const [displayUsername, setDisplayUsername] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('is_verified, reputation_points, display_username').eq('id', session.user.id).single()
          .then(({ data }) => { setIsVerified(data?.is_verified === true); setRepPoints(data?.reputation_points ?? 0); setDisplayUsername(data?.display_username ?? null) })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('is_verified, reputation_points, display_username').eq('id', session.user.id).single()
          .then(({ data }) => { setIsVerified(data?.is_verified === true); setRepPoints(data?.reputation_points ?? 0); setDisplayUsername(data?.display_username ?? null) })
      } else {
        setIsVerified(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-icon.png" alt="Contractor Burnlist" width={44} height={44} style={{ height: '44px', width: 'auto', mixBlendMode: 'multiply' }} priority />
            <div className="flex flex-col leading-none" style={{ fontFamily: "'Arial Black', 'Arial', sans-serif" }}>
              <span className="text-sm font-black text-[#111111] tracking-wide">CONTRACTOR</span>
              <div className="my-0.5 h-px w-full bg-[#DC2626]" />
              <span className="text-sm font-black text-[#DC2626] tracking-wide">BURNLIST</span>
            </div>
          </Link>

          {/* Center Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/search"
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              Search Registry
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              Submit Report
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              Dashboard
            </Link>
            <Link
              href="/my-profile"
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              My Profile
            </Link>
          </div>

          {/* Right Nav */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                  {isVerified && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600 shrink-0">
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  <span className="max-w-[160px] truncate">{displayUsername ?? user.email}</span>
                </span>
                <ReputationBadge points={repPoints} />
                <button
                  onClick={handleSignOut}
                  className="rounded border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#6b7280] transition-colors hover:border-[#d1d5db] hover:text-[#111111]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
                >
                  Login
                </Link>
                <Link
                  href="/pricing"
                  className="rounded bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Get Access
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="flex items-center md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-[#111111] transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-6 bg-[#111111] transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-[#111111] transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#e5e7eb] bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/search" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Search Registry</Link>
            <Link href="/submit" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Submit Report</Link>
            <Link href="/dashboard" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/my-profile" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>My Profile</Link>
            {user ? (
              <>
                <span className="flex items-center gap-1.5 text-sm text-[#6b7280]">
                  {isVerified && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-green-600 shrink-0">
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="currentColor" opacity="0.15"/>
                      <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {displayUsername ?? user.email}
                  <ReputationBadge points={repPoints} />
                </span>
                <button onClick={() => { handleSignOut(); setMobileOpen(false) }} className="text-left text-sm text-[#6b7280] hover:text-[#111111]">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link href="/pricing" className="inline-block rounded bg-[#DC2626] px-4 py-2 text-center text-sm font-semibold text-white" onClick={() => setMobileOpen(false)}>Get Access</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
