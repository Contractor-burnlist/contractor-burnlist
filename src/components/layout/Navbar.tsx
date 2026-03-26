'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

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
              Submit Entry
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
            >
              Dashboard
            </Link>
          </div>

          {/* Right Nav */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#6b7280] transition-colors hover:text-[#111111]"
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
            <Link href="/submit" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Submit Entry</Link>
            <Link href="/dashboard" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Dashboard</Link>
            <Link href="/auth/login" className="text-sm text-[#6b7280] hover:text-[#111111]" onClick={() => setMobileOpen(false)}>Login</Link>
            <Link href="/auth/login" className="inline-block rounded bg-[#DC2626] px-4 py-2 text-center text-sm font-semibold text-white" onClick={() => setMobileOpen(false)}>Get Access</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
