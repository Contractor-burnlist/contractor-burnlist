type Entry = {
  submitted_by?: string | null
  amount_owed?: number | null
  category_tags?: string[] | null
  incident_date?: string | null
  created_at?: string | null
  submitter_verified?: boolean | null
  is_verified_submission?: boolean | null
}

type RiskResult = {
  score: number
  label: string
  color: string
  bg: string
  factors: string[]
}

const CUSTOMER_SEVERITY: Record<string, number> = {
  'Non-payment': 8, 'Fraudulent chargeback / disputed work': 12,
  'Stopped payment / bounced check': 9, 'Scope / contract dispute': 6,
  'Hostile / threatening / abusive': 10, 'Refused access / locked out': 5,
  'False damage / insurance claim': 12, 'False licensing board complaint': 11,
  'Threatened bad reviews as leverage': 7, 'Pattern of bad behavior': 8,
}

const CUSTOMER_HIGH_SEV = new Set([
  'Fraudulent chargeback / disputed work', 'Hostile / threatening / abusive',
  'False damage / insurance claim', 'False licensing board complaint',
])

const WORKER_SEVERITY: Record<string, number> = {
  'Theft / missing materials': 12, 'Unlicensed / misrepresented credentials': 11,
  'Substance abuse on site': 10, 'Property damage': 9,
  'No-show / abandoned job': 9, 'Substandard / defective work': 6,
  'Hostile / threatening / abusive': 10, 'Overbilling / invoice fraud': 8,
  'Refused to fix warranty issue': 5, 'Left job incomplete': 7,
  'Pattern of bad behavior': 8,
}

const WORKER_HIGH_SEV = new Set([
  'Theft / missing materials', 'Unlicensed / misrepresented credentials',
  'Substance abuse on site', 'Hostile / threatening / abusive',
])

function getReportPoints(count: number): number {
  if (count >= 4) return 20
  if (count === 3) return 15
  if (count === 2) return 10
  return count === 1 ? 5 : 0
}

function getSubmitterPoints(count: number): number {
  if (count >= 4) return 20
  if (count === 3) return 14
  if (count === 2) return 8
  return count === 1 ? 3 : 0
}

function getAmountPoints(total: number): number {
  if (total > 25000) return 15
  if (total > 10000) return 13
  if (total > 5000) return 11
  if (total > 2000) return 8
  if (total > 500) return 5
  return total > 0 ? 2 : 0
}

function getRecencyPoints(mostRecentDate: string | null): number {
  if (!mostRecentDate) return 0
  const days = (Date.now() - new Date(mostRecentDate).getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 30) return 10
  if (days <= 90) return 7
  if (days <= 180) return 5
  if (days <= 365) return 3
  return 1
}

function getVerifiedPoints(verifiedCount: number, total: number): number {
  if (total === 0) return 0
  const ratio = verifiedCount / total
  if (ratio >= 1) return 10
  if (ratio >= 0.75) return 8
  if (ratio >= 0.5) return 5
  return verifiedCount > 0 ? 3 : 1
}

function getSeverityPoints(entries: Entry[], sevMap: Record<string, number>, highSevSet: Set<string>): { points: number; categories: string[] } {
  let maxSev = 0
  const highSevFound = new Set<string>()
  const allCats = new Set<string>()

  for (const e of entries) {
    for (const tag of e.category_tags ?? []) {
      allCats.add(tag)
      const sev = sevMap[tag] ?? 0
      if (sev > maxSev) maxSev = sev
      if (highSevSet.has(tag)) highSevFound.add(tag)
    }
  }

  const bonus = Math.max(0, highSevFound.size - 1) * 3
  return { points: Math.min(maxSev + bonus, 25), categories: [...allCats] }
}

function scoreToTier(score: number): { label: string; color: string; bg: string } {
  if (score === 0) return { label: 'No Feedback', color: 'text-[#9ca3af]', bg: 'bg-gray-100' }
  if (score <= 2) return { label: 'Low Risk', color: 'text-green-600', bg: 'bg-green-50' }
  if (score <= 4) return { label: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-50' }
  if (score <= 6) return { label: 'Elevated Risk', color: 'text-orange-500', bg: 'bg-orange-50' }
  if (score <= 8) return { label: 'High Risk', color: 'text-[#DC2626]', bg: 'bg-red-50' }
  return { label: 'Severe Risk', color: 'text-red-700', bg: 'bg-red-100' }
}

export function calculateCustomerRisk(entries: Entry[]): RiskResult {
  if (entries.length === 0) return { score: 0, label: 'No Feedback', color: 'text-[#9ca3af]', bg: 'bg-gray-100', factors: [] }
  return calculate(entries, CUSTOMER_SEVERITY, CUSTOMER_HIGH_SEV)
}

export function calculateWorkerRisk(entries: Entry[]): RiskResult {
  if (entries.length === 0) return { score: 0, label: 'No Feedback', color: 'text-[#9ca3af]', bg: 'bg-gray-100', factors: [] }
  return calculate(entries, WORKER_SEVERITY, WORKER_HIGH_SEV)
}

function calculate(entries: Entry[], sevMap: Record<string, number>, highSevSet: Set<string>): RiskResult {
  const factors: string[] = []

  const uniqueSubmitters = new Set(entries.map((e) => e.submitted_by).filter(Boolean))
  const totalOwed = entries.reduce((sum, e) => sum + (e.amount_owed ?? 0), 0)
  const verifiedCount = entries.filter((e) => e.submitter_verified || e.is_verified_submission).length
  const dates = entries.map((e) => e.incident_date ?? e.created_at).filter(Boolean) as string[]
  const mostRecent = dates.length > 0 ? dates.sort().reverse()[0] : null
  const { points: sevPoints, categories } = getSeverityPoints(entries, sevMap, highSevSet)

  const f1 = getReportPoints(entries.length)
  const f2 = getSubmitterPoints(uniqueSubmitters.size)
  const f3 = getAmountPoints(totalOwed)
  const f4 = sevPoints
  const f5 = getRecencyPoints(mostRecent)
  const f6 = getVerifiedPoints(verifiedCount, entries.length)

  const raw = f1 + f2 + f3 + f4 + f5 + f6
  const score = Math.min(Math.round(raw) / 10, 10)

  factors.push(`${entries.length} feedback entr${entries.length > 1 ? 'ies' : 'y'} from ${uniqueSubmitters.size} contractor${uniqueSubmitters.size !== 1 ? 's' : ''}`)
  if (totalOwed > 0) factors.push(`Total amount owed: $${totalOwed.toLocaleString()}`)
  if (categories.length > 0) factors.push(`Categories: ${categories.slice(0, 3).join(', ')}`)
  if (mostRecent) {
    const days = Math.round((Date.now() - new Date(mostRecent).getTime()) / (1000 * 60 * 60 * 24))
    factors.push(`Most recent feedback: ${days <= 1 ? 'today' : days + ' days ago'}`)
  }
  if (verifiedCount > 0) factors.push(`${Math.round(verifiedCount / entries.length * 100)}% from verified contractors`)

  const tier = scoreToTier(score)
  return { score, ...tier, factors }
}

export function riskScoreLabel(score: number | null): { label: string; color: string; bg: string } {
  return scoreToTier(score ?? 0)
}
