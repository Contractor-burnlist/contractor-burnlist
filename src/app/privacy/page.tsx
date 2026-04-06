import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Privacy Policy</h1>
        <p className="mb-6 text-[#6b7280]">How Contractor Burnlist collects, uses, and protects your information.</p>

        <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          IMPORTANT: This privacy policy was drafted as a comprehensive framework. It should be reviewed by a licensed attorney and privacy professional before being relied upon for legal compliance. This document does not constitute legal advice.
        </div>
        <div className="mb-10 rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-xs text-[#6b7280]">
          Last updated: April 2026.
        </div>

        <div className="space-y-12 text-sm leading-7 text-[#374151]">

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">1. Information We Collect</h2>
          <p className="mb-2 font-semibold text-[#111111]">Categories of personal information we collect:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Identifiers:</strong> Name, email address, Google account ID, IP address, display username.</li>
            <li><strong>Commercial information:</strong> Subscription history, transaction records.</li>
            <li><strong>Internet or electronic network activity:</strong> Browser type, pages visited, features used.</li>
            <li><strong>Professional or employment-related information:</strong> Business name, trade, business address, business phone, Google Business Profile URL.</li>
            <li><strong>Geolocation data:</strong> State and city, as voluntarily provided.</li>
          </ul>
          <p className="mt-4 mb-2 font-semibold text-[#111111]">Categories of personal information we DO NOT collect:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Social Security numbers.</li>
            <li>Driver&apos;s license or state ID numbers.</li>
            <li>Financial account numbers or credit card information (payment processing is handled entirely by Stripe).</li>
            <li>Medical or health information.</li>
            <li>Biometric data.</li>
            <li>Precise geolocation data.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">2. How We Use Your Information</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To create and manage your account.</li>
            <li>To display your reports, comments, and community contributions (anonymously — your real identity is never shown).</li>
            <li>To process subscription payments through Stripe.</li>
            <li>To verify your business through Google Business Profile linking.</li>
            <li>To calculate trust scores and reputation ranks.</li>
            <li>To communicate with you about your account, disputes, or platform updates.</li>
            <li>To enforce our <Link href="/terms" className="font-semibold text-[#DC2626] hover:underline">Terms &amp; Conditions</Link> and prevent abuse.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">3. Data Shared With Third Parties</h2>
          <p className="mb-3">We share personal information with the following categories of third parties for the following business purposes:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-[#e5e7eb]"><th className="pb-2 text-left font-semibold text-[#111111]">Provider</th><th className="pb-2 text-left font-semibold text-[#111111]">Purpose</th><th className="pb-2 text-left font-semibold text-[#111111]">Data Shared</th></tr></thead>
              <tbody className="divide-y divide-[#e5e7eb]">
                <tr><td className="py-2">Supabase</td><td className="py-2">Database hosting &amp; authentication</td><td className="py-2">Identifiers, account data</td></tr>
                <tr><td className="py-2">Stripe</td><td className="py-2">Payment processing</td><td className="py-2">Email, subscription data</td></tr>
                <tr><td className="py-2">Vercel</td><td className="py-2">Website hosting</td><td className="py-2">IP addresses, browser data</td></tr>
                <tr><td className="py-2">Google</td><td className="py-2">OAuth authentication</td><td className="py-2">Google account ID, email</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#6b7280]">Stripe receives payment card information directly during checkout; we never receive or store payment card data.</p>
          <p className="mt-3 rounded border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-xs font-semibold text-[#DC2626]">WE DO NOT SELL OR SHARE PERSONAL INFORMATION FOR CROSS-CONTEXT BEHAVIORAL ADVERTISING AS DEFINED BY THE CALIFORNIA CONSUMER PRIVACY ACT.</p>
          <p className="mt-3 rounded border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-xs font-semibold text-[#DC2626]">Information on this platform is not intended for and may not be used for employment, insurance, housing, credit, or any other decisions governed by the Fair Credit Reporting Act (FCRA) or the Investigative Consumer Reporting Agencies Act (ICRAA).</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">4. Data of Reported Parties</h2>
          <p>Contractor Burnlist collects and stores personal information about individuals reported by users (reported parties), including names, initials, addresses, phone numbers, city, state, and descriptions of alleged incidents.</p>
          <p className="mt-2">Reported parties are not users of the platform and have not consented to the collection of their personal information. This information is submitted by third-party users and is hosted by Contractor Burnlist as a neutral platform under Section 230 of the Communications Decency Act.</p>
          <p className="mt-2">Reported parties who wish to dispute, correct, or request removal of information about them should contact <a href="mailto:support@contractorburnlist.com" className="font-semibold text-[#DC2626] hover:underline">support@contractorburnlist.com</a>. See our <Link href="/terms" className="font-semibold text-[#DC2626] hover:underline">Terms &amp; Conditions</Link> for our full dispute resolution process.</p>
          <p className="mt-2 text-xs text-[#6b7280]">IMPORTANT: Contractor Burnlist does not verify the accuracy of information submitted about reported parties. All reports reflect the personal experiences and opinions of the submitting user.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">5. Submitter Anonymity</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Your real name, email, business name, and contact details are <strong>never</strong> displayed publicly on reports or comments.</li>
            <li>Only your chosen display username (or &quot;Anonymous Contractor&quot;), reputation rank, and verified badge status are shown publicly.</li>
            <li>Your <code className="rounded bg-[#f9fafb] px-1 text-[#DC2626]">submitted_by</code> user ID is stored internally for account management but is never exposed through any public-facing query or API.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">6. California Consumer Privacy Act (CCPA) Rights</h2>
          <p>If you are a California resident, you have the following rights under the CCPA (Cal. Civ. Code &sect; 1798.100 et seq.):</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li><strong>Right to know:</strong> You may request that we disclose the categories and specific pieces of personal information we have collected about you.</li>
            <li><strong>Right to delete:</strong> You may request that we delete the personal information we have collected about you, subject to certain exceptions.</li>
            <li><strong>Right to correct:</strong> You may request that we correct inaccurate personal information.</li>
            <li><strong>Right to opt-out:</strong> You may opt out of the sale or sharing of your personal information. Note: we do not sell personal information.</li>
            <li><strong>Right to limit:</strong> You may limit the use and disclosure of sensitive personal information.</li>
            <li><strong>Right to non-discrimination:</strong> We will not discriminate against you for exercising your CCPA rights.</li>
          </ul>
          <p className="mt-3">To exercise your CCPA rights, email <a href="mailto:support@contractorburnlist.com" className="font-semibold text-[#DC2626] hover:underline">support@contractorburnlist.com</a> with the subject line &quot;CCPA Request.&quot; Include your name, email address associated with your account, and specify which right(s) you wish to exercise. We will verify your identity and respond within 45 calendar days.</p>
          <p className="mt-2">You may designate an authorized agent to make requests on your behalf. We may require the authorized agent to provide proof of authorization.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">7. Data Security</h2>
          <p>We implement reasonable administrative, technical, and physical security measures to protect your personal information, including encryption in transit (TLS) and at rest, secure authentication via Google OAuth, and role-based access controls on our database.</p>
          <p className="mt-2 text-xs font-semibold uppercase text-[#111111]">NO METHOD OF TRANSMISSION OVER THE INTERNET OR METHOD OF ELECTRONIC STORAGE IS 100% SECURE. WE CANNOT GUARANTEE ABSOLUTE SECURITY OF YOUR DATA.</p>
          <p className="mt-2">In the event of a data breach affecting your personal information, we will notify you and applicable regulatory authorities as required by applicable law, including California Civil Code &sect; 1798.82.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">8. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations, resolve disputes, and enforce our agreements. If you request account deletion, we will delete or anonymize your personal information within 45 days, except where retention is required by law or for legitimate business purposes (e.g., preventing fraud or abuse).</p>
          <p className="mt-2">Reports submitted by users may be retained even after account deletion, as they constitute user-generated content licensed to the platform under our Terms &amp; Conditions. However, the association with your identity will be removed.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">9. Law Enforcement and Legal Process</h2>
          <p>Contractor Burnlist may disclose personal information to law enforcement agencies, government officials, or other third parties when: (a) required by law, subpoena, court order, or other legal process; (b) we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request; (c) we believe in good faith that disclosure is necessary to prevent imminent physical harm or financial loss.</p>
          <p className="mt-2">If we receive a valid legal request for user information, we will make reasonable efforts to notify the affected user before disclosing their information, unless prohibited by law or court order from doing so, or unless we believe notification would be futile or create a risk of harm.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">10. Cookies and Tracking</h2>
          <p>Contractor Burnlist uses essential cookies for authentication and session management (via Supabase Auth). We do not use third-party advertising cookies, tracking pixels, or cross-site behavioral tracking.</p>
          <p className="mt-2">Standard web server logs (hosted by Vercel) may record your IP address, browser type, and pages visited for security and performance monitoring purposes.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">11. International Users</h2>
          <p>Contractor Burnlist is operated from the United States and is intended for use by contractors and businesses operating in the United States. If you access the platform from outside the United States, you do so at your own initiative and are responsible for compliance with local laws.</p>
          <p className="mt-2">By using the platform, you consent to the transfer of your personal information to the United States, which may have different data protection laws than your country of residence.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">12. Children&apos;s Privacy</h2>
          <p>Contractor Burnlist is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information promptly.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">13. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of the Platform after changes constitutes acceptance of the updated policy.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">14. Contact</h2>
          <p>For privacy-related questions or to exercise your rights, contact us at:</p>
          <p className="mt-2"><a href="mailto:support@contractorburnlist.com" className="font-semibold text-[#DC2626] hover:underline">support@contractorburnlist.com</a></p>
          <p className="mt-1 text-[#9ca3af]">Mailing address: [To be provided before launch]</p>
        </section>

        <div className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-xs text-[#9ca3af]">
          This privacy policy was last reviewed on April 2026. Contractor Burnlist recommends consulting with a licensed attorney or privacy professional for guidance specific to your situation.
        </div>
        </div>
      </div>
    </div>
  )
}
