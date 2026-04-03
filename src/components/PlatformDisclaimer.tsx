import Link from 'next/link'

export default function PlatformDisclaimer({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  if (variant === 'full') {
    return (
      <div className="rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-5">
        <div className="flex gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[#9ca3af]">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-xs leading-relaxed text-[#6b7280]">
            <strong className="text-[#9ca3af]">Disclaimer:</strong> Contractor Burnlist is a neutral peer-to-peer platform where contractors share their experiences with customers and workers.
            All content is user-generated and reflects individual opinions and experiences. Contractor Burnlist does not verify, endorse, or take responsibility for the accuracy of any reports.
            This platform is protected under Section 230 of the Communications Decency Act as a neutral forum provider.
            Use of information on this platform is at your own risk.
            See our full <Link href="/terms" className="font-semibold underline hover:text-[#111111]">Terms &amp; Conditions</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5">
      <div className="flex items-start gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[#9ca3af]">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p className="text-xs text-[#9ca3af]">
          Contractor Burnlist is a peer-to-peer forum. All reports reflect individual contractor experiences and opinions, not verified facts.
          By using this platform, you agree to our <Link href="/terms" className="font-semibold underline hover:text-[#6b7280]">Terms &amp; Conditions</Link>.
        </p>
      </div>
    </div>
  )
}
