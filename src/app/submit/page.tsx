'use client'

import { useState } from 'react'

const categoryOptions = [
  'Non-payment',
  'Bounced check',
  'Fraud / false claims',
  'Chargeback abuse',
  'Threatening behavior',
  'Property damage dispute',
  'Permit fraud',
  'Other',
]

export default function SubmitPage() {
  const [form, setForm] = useState({
    full_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    description: '',
    amount_owed: '',
    incident_date: '',
    categories: [] as string[],
  })

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire to Supabase insert
    alert('Entry submitted! (Supabase integration coming)')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Submit an Entry</h1>
        <p className="text-[#6b7280]">
          Report a problem customer. All submissions are reviewed before publication.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <h2 className="mb-4 font-bold text-[#111111]">Customer Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs text-[#6b7280]">Full Name *</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs text-[#6b7280]">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#6b7280]">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs text-[#6b7280]">State</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  maxLength={2}
                  className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#6b7280]">ZIP</label>
                <input
                  name="zip"
                  value={form.zip}
                  onChange={handleChange}
                  className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#6b7280]">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#6b7280]">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
              />
            </div>
          </div>
        </div>

        {/* Incident Details */}
        <div className="rounded-lg border border-[#e5e7eb] bg-white p-6">
          <h2 className="mb-4 font-bold text-[#111111]">Incident Details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs text-[#6b7280]">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded border px-3 py-1.5 text-xs transition-colors ${
                      form.categories.includes(cat)
                        ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]'
                        : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#d1d5db]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-[#6b7280]">Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe what happened in detail..."
                className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] placeholder-[#9ca3af] outline-none focus:border-[#DC2626]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#6b7280]">Amount Owed ($)</label>
                <input
                  name="amount_owed"
                  value={form.amount_owed}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-[#6b7280]">Incident Date</label>
                <input
                  name="incident_date"
                  value={form.incident_date}
                  onChange={handleChange}
                  type="date"
                  className="w-full rounded border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2.5 text-sm text-[#111111] outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded bg-[#DC2626] py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Submit Entry
        </button>
        <p className="text-center text-xs text-[#9ca3af]">
          By submitting you confirm this report is truthful and based on your direct experience.
        </p>
      </form>
    </div>
  )
}
