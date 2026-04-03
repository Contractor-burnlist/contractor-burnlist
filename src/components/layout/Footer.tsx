import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-[#2a2a2a] bg-[#111111] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/logo-icon.png" alt="Contractor Burnlist" width={22} height={22} style={{ height: '22px', width: 'auto' }} />
            <span className="text-sm font-bold text-white">Contractor Burnlist</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6b7280]">
            <Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
            <span className="text-[#4b5563]">|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span className="text-[#4b5563]">|</span>
            <a href="mailto:support@contractorburnlist.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-4 text-center text-xs text-[#4b5563]">
          <p>&copy; {new Date().getFullYear()} Contractor Burnlist. All rights reserved.</p>
          <p className="mt-1">Contractor Burnlist is a peer-to-peer platform. All content is user-generated.</p>
        </div>
      </div>
    </footer>
  )
}
