import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-black text-[#111111]">Terms &amp; Conditions</h1>
        <p className="mb-6 text-[#6b7280]">Please read these terms carefully before using Contractor Burnlist.</p>

        <div className="mb-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          IMPORTANT: These terms were drafted as a comprehensive framework. They should be reviewed by a licensed attorney before being relied upon for legal protection. This document does not constitute legal advice.
        </div>
        <div className="mb-10 rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-xs text-[#6b7280]">
          Last updated: April 2026.
        </div>

        <div className="space-y-12 text-sm leading-7 text-[#374151]">

        {/* Important Legal Notices */}
        <section className="rounded border border-[#111111]/10 bg-[#f9fafb] p-5">
          <p className="mb-3 text-xs font-bold uppercase text-[#111111]">PLEASE READ THESE TERMS CAREFULLY BEFORE USING CONTRACTOR BURNLIST. BY ACCESSING OR USING THIS PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS. IF YOU DO NOT AGREE WITH ANY PART OF THESE TERMS, YOU MUST NOT USE THE PLATFORM.</p>
          <p className="mb-3 text-xs font-bold uppercase text-[#111111]">THESE TERMS CONTAIN AN ARBITRATION AGREEMENT, A LIMITATION OF LIABILITY, AN INDEMNIFICATION CLAUSE, AND A CLASS ACTION WAIVER THAT AFFECT YOUR LEGAL RIGHTS. PLEASE REVIEW THEM CAREFULLY.</p>
          <p className="text-xs font-bold uppercase text-[#DC2626]">CONTRACTOR BURNLIST IS NOT A LEGAL SERVICE, CONSUMER REPORTING AGENCY, OR INVESTIGATIVE SERVICE. THIS PLATFORM IS A PEER-TO-PEER FORUM WHERE CONTRACTORS SHARE THEIR PERSONAL EXPERIENCES AND OPINIONS.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">1. Acceptance of Terms</h2>
          <p>By accessing or using Contractor Burnlist (&quot;the Platform&quot;), you acknowledge that you have read, understood, and agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, you must not access or use the Platform.</p>
          <p className="mt-2">Contractor Burnlist reserves the right to update, modify, or replace these terms at any time. Changes will be posted on this page with an updated &quot;Last updated&quot; date. Your continued use of the Platform after any such changes constitutes your acceptance of the revised terms.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">2. Platform Description</h2>
          <p>Contractor Burnlist is a peer-to-peer information sharing forum operated by contractors, for contractors. The Platform allows licensed and unlicensed contractors to share their firsthand experiences with customers and workers.</p>
          <p className="mt-2">Contractor Burnlist does <strong>not</strong> verify, endorse, edit, investigate, confirm, or assume responsibility for the accuracy, truthfulness, or completeness of any report, comment, or content submitted by users. Contractor Burnlist is a neutral platform provider and does not participate in, mediate, or adjudicate disputes between users and reported parties. All content on this Platform represents the personal experiences, opinions, and perspectives of individual users.</p>
          <p className="mt-3 rounded border border-[#DC2626]/20 bg-[#DC2626]/5 px-4 py-3 text-xs font-semibold text-[#DC2626]">Contractor Burnlist is NOT a consumer reporting agency as defined by the Fair Credit Reporting Act (FCRA), 15 U.S.C. &sect; 1681 et seq., or the Investigative Consumer Reporting Agencies Act (ICRAA), California Civil Code &sect; 1786 et seq. Information on this platform may not be used for any purpose governed by the FCRA or ICRAA, including but not limited to: employment screening, tenant screening, credit decisions, insurance underwriting, housing decisions, or any other purpose that would require compliance with the FCRA or ICRAA. This platform is not intended to be used for employment, insurance, or housing decisions.</p>
          <p className="mt-2">Contractor Burnlist does NOT function as a background check service, credit reporting service, or investigative agency. The platform should not be used as a substitute for proper due diligence, background checks, or professional vetting services.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">3. Section 230 Safe Harbor</h2>
          <p>Contractor Burnlist operates as an interactive computer service under Section 230 of the Communications Decency Act (47 U.S.C. &sect; 230). As a platform provider, Contractor Burnlist is not the publisher or speaker of any user-generated content.</p>
          <p className="mt-2">Pursuant to 47 U.S.C. &sect; 230(c)(1), Contractor Burnlist is an &quot;interactive computer service&quot; and is not the &quot;information content provider&quot; of user-generated reports, comments, or other content. Users who submit content are the information content providers and bear sole responsibility for their submissions.</p>
          <p className="mt-2">Contractor Burnlist exercises its right under 47 U.S.C. &sect; 230(c)(2) to moderate, remove, or restrict access to content that it considers in good faith to be obscene, lewd, lascivious, filthy, excessively violent, harassing, or otherwise objectionable, regardless of whether such material is constitutionally protected.</p>
          <p className="mt-2">Nothing in these terms shall be construed to limit or waive the protections afforded to Contractor Burnlist under Section 230 of the Communications Decency Act.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">4. User Responsibilities and Conduct</h2>
          <p>By using the Platform, you represent and agree that:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>You are 18 years of age or older.</li>
            <li>You will submit only truthful, good-faith reports based on real, firsthand experiences.</li>
            <li>All information you submit is accurate to the best of your knowledge.</li>
            <li>You will not submit knowingly false, fabricated, malicious, or defamatory content. Doing so is strictly prohibited and grounds for immediate account termination.</li>
            <li>You will not use the Platform to harass, threaten, stalk, or intimidate any individual.</li>
            <li>You will not submit reports as a form of retaliation, extortion, or competitive sabotage.</li>
            <li>You are solely responsible for any legal consequences arising from your submissions.</li>
          </ul>
          <div className="mt-4 rounded border border-amber-300 bg-amber-50 px-4 py-3">
            <p className="mb-2 text-xs font-bold uppercase text-amber-900">IMPORTANT — User Liability for Submissions</p>
            <p className="text-xs leading-relaxed text-amber-800">YOU, NOT CONTRACTOR BURNLIST, ARE SOLELY AND ENTIRELY RESPONSIBLE FOR THE CONTENT YOU SUBMIT. If you submit a report that contains false statements of fact about an identifiable individual, YOU may be subject to a defamation lawsuit brought by the reported party. Contractor Burnlist is protected from such claims under Section 230, but individual users who submit false or defamatory content are NOT protected.</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">Before submitting a report, you should understand that: (a) truth is a complete defense to defamation — only submit truthful reports based on firsthand experience; (b) opinions are generally protected speech, but statements presented as facts that can be proven false may constitute actionable defamation; (c) stating &quot;I believe&quot; or &quot;in my opinion&quot; does not automatically convert a factual claim into a protected opinion; (d) you may be required to defend your statements in court if the reported party files a legal action against you.</p>
          </div>
          <p className="mt-3">By submitting content, you represent and warrant that: (a) your submission is based on your direct, firsthand experience; (b) the information you provide is truthful and accurate to the best of your knowledge; (c) you are not submitting the report for purposes of harassment, retaliation, extortion, competitive sabotage, or any other improper purpose; (d) you understand that you bear sole legal responsibility for your submissions.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">5. Anti-Defamation and Good Faith Reporting</h2>
          <p>Contractor Burnlist encourages good faith reporting of genuine experiences. Reports should describe what happened factually and may include the submitter&apos;s personal opinions about the experience.</p>
          <p className="mt-2">The following types of submissions are PROHIBITED and may result in immediate account termination:</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Knowingly false statements of fact.</li>
            <li>Reports submitted for purposes of harassment, intimidation, or retaliation unrelated to a genuine business experience.</li>
            <li>Reports submitted as part of a competitive scheme to harm a rival business.</li>
            <li>Reports containing threats of violence or illegal activity.</li>
            <li>Reports that include personal information beyond what is necessary to identify the reported party in a business context (e.g., social security numbers, financial account numbers, medical information).</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">6. Privacy and Anonymity</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Submitter identities are kept strictly confidential and are never revealed publicly.</li>
            <li>Business profile information provided by users is never displayed publicly and is used solely for internal verification purposes.</li>
            <li>Only initials of reported individuals are shown publicly (e.g., &quot;J.S.&quot;). Full names are stored internally and never displayed.</li>
            <li>Full contact details of reported individuals (address, phone) are only accessible to subscribers at the Fortress tier level.</li>
            <li>Contractor Burnlist will only disclose user information if required by law, court order, or valid legal process.</li>
          </ul>
          <p className="mt-2">For full details on data collection, use, and sharing, see our <Link href="/privacy" className="font-semibold text-[#DC2626] hover:underline">Privacy Policy</Link>.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">7. Content Ownership and License</h2>
          <p>Users retain ownership of their submitted content. By submitting content to the Platform, you grant Contractor Burnlist a non-exclusive, royalty-free, perpetual, worldwide license to display, distribute, and use the content on the Platform in connection with the operation and promotion of the service.</p>
          <p className="mt-2">Contractor Burnlist reserves the right to remove any content at its sole discretion, for any reason or no reason, without notice.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">8. Dispute Resolution for Reported Parties</h2>
          <p>If you believe that a report about you on Contractor Burnlist contains false or defamatory information, you may submit a dispute by emailing <a href="mailto:support@contractorburnlist.com" className="font-semibold text-[#DC2626] hover:underline">support@contractorburnlist.com</a> with: (a) your full name and contact information; (b) identification of the specific report(s) you are disputing; (c) a detailed explanation of why the report is false or inaccurate; (d) any supporting documentation.</p>
          <p className="mt-2">Contractor Burnlist will review disputes in good faith. However, Contractor Burnlist does not adjudicate the truth of reports. We provide the platform, not the verdict.</p>
          <p className="mt-2">Contractor Burnlist reserves the right, but has no obligation, to remove or modify content in response to disputes. Removal of content in response to a dispute shall not be construed as an admission that the content was false, defamatory, or otherwise unlawful.</p>
          <p className="mt-2">If you believe content on this platform violates your legal rights, you may pursue legal remedies against the individual who submitted the content. As a provider of an interactive computer service under Section 230 of the Communications Decency Act, Contractor Burnlist is not liable for content submitted by its users.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">9. California Anti-SLAPP Protection Notice</h2>
          <p>Contractor Burnlist is based in California. Users should be aware that California&apos;s Anti-SLAPP statute (Code of Civil Procedure &sect; 425.16) provides protections against Strategic Lawsuits Against Public Participation. This statute may protect users who submit good-faith reports on matters of public concern from meritless lawsuits filed primarily to silence or intimidate them.</p>
          <p className="mt-2">If a reported party files a lawsuit against you solely to suppress your truthful report, you may be able to invoke California&apos;s Anti-SLAPP protections, which can result in early dismissal of the case and an award of attorney&apos;s fees against the party who filed the meritless lawsuit.</p>
          <p className="mt-2 text-xs text-[#9ca3af]">DISCLAIMER: This information is provided for general educational purposes only and does not constitute legal advice. Contractor Burnlist does not provide legal representation or advice. If you are threatened with legal action related to a report you submitted, you should consult with a licensed attorney in your jurisdiction.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">10. Subscriptions and Payments</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Report submissions and community participation are free for all authenticated users.</li>
            <li>Viewing search results and report details requires a paid subscription: Shield ($19/month) for the customer database, or Fortress ($39/month) for full access including the worker database and contact details.</li>
            <li>Subscriptions are billed monthly through Stripe.</li>
            <li>Users may cancel at any time through the billing portal.</li>
            <li>No refunds are provided for partial billing periods.</li>
            <li>Contractor Burnlist reserves the right to change pricing with 30 days&apos; notice to active subscribers.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">11. Disclaimer of Warranties</h2>
          <p>The Platform is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          <p className="mt-2">Contractor Burnlist makes no warranty regarding the accuracy, completeness, reliability, or usefulness of any content on the Platform. Contractor Burnlist does not guarantee that the Platform will be uninterrupted, error-free, or secure. Use of information found on the Platform is at the user&apos;s own risk.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">12. No Warranty of Safety</h2>
          <p>Contractor Burnlist does not warrant or guarantee that the information in the database will protect you from financial loss, fraud, theft, or any other harm. The platform is a tool for information sharing among contractors and should be used as one component of your overall business due diligence process.</p>
          <p className="mt-2">You should not rely solely on the presence or absence of a report on Contractor Burnlist when making business decisions. The absence of a report does not mean a customer or worker is trustworthy, and the presence of a report does not necessarily mean a customer or worker is untrustworthy.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">13. Limitation of Liability</h2>
          <p className="font-semibold uppercase text-xs text-[#111111]">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CONTRACTOR BURNLIST, ITS OWNERS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, REPUTATION, USE, DATA, OR OTHER INTANGIBLE LOSSES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STATUTE, OR ANY OTHER LEGAL THEORY, WHETHER OR NOT CONTRACTOR BURNLIST HAS BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.</p>
          <p className="mt-3 font-semibold uppercase text-xs text-[#111111]">THE TOTAL AGGREGATE LIABILITY OF CONTRACTOR BURNLIST FOR ALL CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO CONTRACTOR BURNLIST IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).</p>
          <p className="mt-3 text-xs text-[#6b7280]">Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you. In such jurisdictions, the liability of Contractor Burnlist shall be limited to the maximum extent permitted by law.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">14. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless Contractor Burnlist, its owners, officers, directors, employees, agents, affiliates, and licensors from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses (including but not limited to reasonable attorney&apos;s fees and legal costs) arising from or related to: (a) your use of the platform; (b) content you submit, post, or otherwise make available through the platform; (c) your violation of these terms; (d) your violation of any law, regulation, or third-party right, including but not limited to any intellectual property, privacy, or defamation claim; (e) any dispute between you and a reported party arising from content you submitted.</p>
          <p className="mt-2">This indemnification obligation shall survive the termination of your account and these terms.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">15. Arbitration Agreement and Class Action Waiver</h2>
          <p className="font-semibold text-xs uppercase text-[#111111]">BINDING ARBITRATION: Any dispute, claim, or controversy arising out of or relating to these terms or your use of Contractor Burnlist shall be resolved through binding individual arbitration administered by the American Arbitration Association (AAA) in accordance with its Commercial Arbitration Rules, except as otherwise provided herein.</p>
          <p className="mt-3 font-semibold text-xs uppercase text-[#111111]">CLASS ACTION WAIVER: YOU AND CONTRACTOR BURNLIST AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, CONSOLIDATED, OR REPRESENTATIVE PROCEEDING.</p>
          <p className="mt-3"><strong>Opt-Out:</strong> You may opt out of this arbitration agreement by sending written notice to <a href="mailto:support@contractorburnlist.com" className="font-semibold text-[#DC2626] hover:underline">support@contractorburnlist.com</a> within 30 days of first accepting these terms. The notice must include your name, email address, and a clear statement that you wish to opt out of the arbitration agreement.</p>
          <p className="mt-2"><strong>Exceptions:</strong> The following are not subject to arbitration: (a) claims that qualify for small claims court; (b) any claim for injunctive or equitable relief.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">16. Account Termination</h2>
          <p>Contractor Burnlist reserves the right to suspend or terminate any account at any time, for any reason, with or without notice. Grounds for termination include but are not limited to: submitting false information, harassment, abuse of the Platform, or violation of any provision of these terms.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">17. Governing Law and Jurisdiction</h2>
          <p>These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. The exclusive jurisdiction and venue for any disputes shall be the state and federal courts located in Riverside County, California, and you consent to personal jurisdiction in such courts.</p>
        </section>

        <section>
          <h2 className="mb-3 border-b border-[#e5e7eb] pb-2 text-lg font-bold text-[#111111]">18. Contact</h2>
          <p>For questions, disputes, or legal inquiries, please contact us at:</p>
          <p className="mt-2">
            <a href="mailto:support@contractorburnlist.com" className="font-semibold text-[#DC2626] hover:underline">support@contractorburnlist.com</a>
          </p>
          <p className="mt-1 text-[#9ca3af]">Mailing address: [To be provided before launch]</p>
        </section>

        <div className="rounded border border-[#e5e7eb] bg-[#f9fafb] px-4 py-3 text-xs text-[#9ca3af]">
          These terms were last reviewed on April 2026. Contractor Burnlist recommends that users consult with their own legal counsel regarding their rights and obligations under these terms and applicable law.
        </div>
        </div>
      </div>
    </div>
  )
}
