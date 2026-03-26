'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  async function handleGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-[#DC2626]">
              <span className="text-xs font-black text-white">CB</span>
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-black text-white">Sign in to Contractor Burnlist</h1>
          <p className="mt-2 text-sm text-[#a0a0a0]">Verified contractors only</p>
        </div>

        <div className="rounded-lg border border-[#2a2a2a] bg-[#111111] p-6">
          {sent ? (
            <div className="text-center">
              <div className="mb-3 text-3xl">📬</div>
              <p className="font-semibold text-white">Check your email</p>
              <p className="mt-2 text-sm text-[#a0a0a0]">
                We sent a magic link to <span className="text-white">{email}</span>
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                className="mb-4 flex w-full items-center justify-center gap-3 rounded border border-[#2a2a2a] bg-[#0a0a0a] py-3 text-sm font-medium text-white transition-colors hover:border-[#3a3a3a]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="mb-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#2a2a2a]" />
                <span className="text-xs text-[#555]">or</span>
                <div className="h-px flex-1 bg-[#2a2a2a]" />
              </div>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs text-[#a0a0a0]">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full rounded border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white placeholder-[#555] outline-none focus:border-[#DC2626]"
                  />
                </div>
                {error && <p className="text-xs text-[#DC2626]">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
