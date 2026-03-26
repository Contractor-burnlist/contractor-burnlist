'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 88 88" aria-hidden="true">
              <circle cx="44" cy="44" r="40" fill="#DC2626"/>
              <rect x="26" y="20" width="36" height="48" rx="3" fill="white"/>
              <line x1="32" y1="30" x2="56" y2="30" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
              <line x1="32" y1="38" x2="56" y2="38" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
              <line x1="32" y1="46" x2="56" y2="46" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
              <line x1="32" y1="54" x2="46" y2="54" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
              <line x1="10" y1="10" x2="78" y2="78" stroke="#DC2626" strokeWidth="7" strokeLinecap="round"/>
            </svg>
            <div className="flex flex-col leading-none" style={{ fontFamily: "'Arial Black', 'Arial', sans-serif" }}>
              <span className="text-sm font-black text-white tracking-wide">CONTRACTOR</span>
              <div className="my-0.5 h-px w-full bg-[#DC2626]" />
              <span className="text-sm font-black text-[#DC2626] tracking-wide">BURNLIST</span>
            </div>
          </Link>

          {/* Center Nav */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="/search"
              className="text-sm font-medium text-[#a0a0a0] transition-colors hover:text-white"
            >
              Search Registry
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-[#a0a0a0] transition-colors hover:text-white"
            >
              Submit Entry
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#a0a0a0] transition-colors hover:text-white"
            >
              Dashboard
            </Link>
          </div>

          {/* Right Nav */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#a0a0a0] transition-colors hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/auth/login"
              className="rounded bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Get Access
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex items-center md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-white transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-6 bg-white transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-white transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#2a2a2a] bg-[#0a0a0a] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link href="/search" className="text-sm text-[#a0a0a0] hover:text-white" onClick={() => setMobileOpen(false)}>Search Registry</Link>
            <Link href="/submit" className="text-sm text-[#a0a0a0] hover:text-white" onClick={() => setMobileOpen(false)}>Submit Entry</Link>
            <Link href="/dashboard" className="text-sm text-[#a0a0a0] hover:text-white" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/auth/login" className="text-sm text-[#a0a0a0] hover:text-white" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link href="/auth/login" className="inline-block rounded bg-[#DC2626] px-4 py-2 text-center text-sm font-semibold text-white" onClick={() => setMobileOpen(false)}>Get Access</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
