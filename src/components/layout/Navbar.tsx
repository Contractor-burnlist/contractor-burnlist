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
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#DC2626]">
              <span className="text-xs font-black text-white">CB</span>
            </div>
            <span className="text-lg font-bold text-white">
              Contractor <span className="text-[#DC2626]">Burnlist</span>
            </span>
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
