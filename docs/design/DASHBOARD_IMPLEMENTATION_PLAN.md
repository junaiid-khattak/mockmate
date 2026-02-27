# nayld.ai — Jobs Dashboard Redesign Implementation Plan

## For: Claude Code (or any developer)
## Stack: Next.js (React) · Tailwind CSS · Supabase (Postgres)
## Design Reference: `docs/design/nayld-dashboard-redesign.html` (attached alongside this plan)

---

## Overview

Redesign the **Jobs Dashboard** (`/jobs`) to surface interview status, scores, and progress directly on the jobs list — converting it from a passive list into an active conversion surface that drives users toward the paid action (mock interviews).

**Design reference**: Open `nayld-dashboard-redesign.html` in a browser. It has 3 interactive states you can toggle:
- **Empty State** — no jobs added yet
- **1 Job** — single job with no interviews (nudge banner)
- **3 Jobs (Active)** — multiple jobs with mixed interview states, stats row, credits banner

All visual decisions (colors, spacing, component structure, copy) are in this HTML file. **Match it as closely as possible.**

**IMPORTANT**: Before starting, read the existing jobs dashboard page code thoroughly. Understand the current component structure, data fetching patterns, and routing. Adapt this plan to fit the existing codebase patterns — don't rewrite from scratch.

---

## Phase 0: Understand Current Codebase

Before writing any code, map the existing implementation:

```bash
# Find the jobs dashboard page
find . -type f -name "*.tsx" | xargs grep -l "Your jobs\|Your Jobs\|jobs.*page\|Prepare for a job" | head -20

# Find existing job card components
find . -type f -name "*.tsx" | xargs grep -l "Resume attached\|fit_score\|fitScore\|Add a job" | head -20

# Find data fetching for the jobs list
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "\.from.*jobs\|getJobs\|fetchJobs\|useJobs" | head -20

# Find interview-related queries (we need interview counts per job)
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "interviews.*select\|getInterviews\|interview_count" | head -20

# Check if there's already a credits/billing context or hook
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "credits\|useCredits\|creditCount" | head -20
```

Map out:
- The **Jobs page component** (likely `app/jobs/page.tsx` or `app/(dashboard)/jobs/page.tsx`)
- The **current job card** component (or inline JSX in the page)
- The **data fetching pattern** (server component? React Query? SWR? `useEffect`?)
- The **job type** (`Job` interface — what fields exist?)
- The **interview data** available per job (need counts, scores, latest date)
- The **credits data** (how is it currently fetched and where?)

---

## Phase 1: Data Layer — Aggregate Interview Stats Per Job

The dashboard needs interview data rolled up per job. We need a query that returns jobs with their interview summary.

### 1.1 Create a dashboard-specific query

Create or update: `lib/queries/dashboard.ts` (or wherever your query functions live)

```typescript
// This query should return jobs with aggregated interview stats
// Adapt the table/column names to match your actual schema

export async function getJobsWithInterviewStats() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Option A: If Supabase supports the join/aggregate you need
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      interviews (
        id,
        overall_score,
        attempt_number,
        created_at
      )
    `)
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // Transform into dashboard-ready shape
  const enrichedJobs = (jobs ?? []).map(job => {
    const interviews = job.interviews ?? []
    const scores = interviews
      .map(i => i.overall_score)
      .filter(Boolean)
      .sort((a, b) => a - b)

    return {
      ...job,
      interview_count: interviews.length,
      best_score: scores.length > 0 ? Math.max(...scores) : null,
      first_score: scores.length > 0 ? scores[0] : null,
      latest_score: interviews.length > 0
        ? interviews.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].overall_score
        : null,
      improvement: scores.length >= 2
        ? Math.max(...scores) - Math.min(...scores)
        : null,
      last_interview_at: interviews.length > 0
        ? interviews.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at
        : null,
      // Strip raw interviews from the response to keep it clean
      interviews: undefined,
    }
  })

  return { jobs: enrichedJobs, error }
}

// Return type for reference
export interface DashboardJob {
  id: string
  title: string
  company: string | null
  fit_score: number | null
  resume_name: string | null
  created_at: string
  // Aggregated interview stats
  interview_count: number
  best_score: number | null
  first_score: number | null
  latest_score: number | null
  improvement: number | null
  last_interview_at: string | null
}
```

**IMPORTANT**: Adapt column names (`title`, `company`, `fit_score`, etc.) to match your actual schema. Check the existing Job type for the correct field names.

### 1.2 Create dashboard aggregate stats helper

```typescript
export function computeDashboardStats(jobs: DashboardJob[]) {
  const totalJobs = jobs.length
  const totalInterviews = jobs.reduce((sum, j) => sum + j.interview_count, 0)
  const uniqueCompanies = new Set(jobs.map(j => j.company).filter(Boolean)).size
  const jobsWithInterviews = jobs.filter(j => j.interview_count > 0).length
  const jobsWithoutInterviews = totalJobs - jobsWithInterviews
  const allBestScores = jobs.map(j => j.best_score).filter(Boolean) as number[]
  const overallBestScore = allBestScores.length > 0 ? Math.max(...allBestScores) : null
  const bestScoreJobTitle = overallBestScore
    ? jobs.find(j => j.best_score === overallBestScore)?.title ?? null
    : null

  return {
    totalJobs,
    totalInterviews,
    uniqueCompanies,
    jobsWithInterviews,
    jobsWithoutInterviews,
    overallBestScore,
    bestScoreJobTitle,
  }
}
```

---

## Phase 2: Empty State Redesign

### 2.1 Replace the current empty state

**Current**: Briefcase icon + "Your interview prep starts here" + "Prepare for a job" button
**New**: Interview-focused hero with 3-step flow preview

**Design reference**: See "Empty State" tab in the HTML mockup.

The new empty state should have:

1. **Icon**: Purple gradient rounded square with 🎙️ (microphone) — NOT a briefcase. This signals "interviews" from the first moment.

2. **Headline**: "Nail your first interview" (not "Your interview prep starts here")

3. **Description**: "Add a job you're targeting, upload your resume, and get a fit score + tailored questions — then practice with an AI mock interview."

4. **3-step flow**: Horizontal row of 3 steps connected by arrows:
   - Step 1: "Add a job & your resume"
   - Step 2: "Get fit score & questions"
   - Step 3: **"Practice with AI interview"** (this one in purple/bold — it's the destination)

5. **CTA button**: "+ Add Your First Job" (purple gradient, large)

6. **Subtext**: "Free to start · Takes under 2 minutes"

```tsx
// Tailwind structure
<div className="flex flex-col items-center justify-center min-h-[500px] text-center">
  {/* Purple gradient icon */}
  <div className="w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-purple-500 to-purple-400 flex items-center justify-center text-[32px] shadow-[0_4px_24px_rgba(124,92,252,0.18)] mb-6">
    🎙️
  </div>

  <h2 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-2">
    Nail your first interview
  </h2>

  <p className="text-[15px] text-gray-500 max-w-[440px] leading-relaxed mb-7">
    Add a job you're targeting, upload your resume, and get a fit score
    + tailored questions — then practice with an AI mock interview.
  </p>

  {/* 3-step flow */}
  <div className="flex items-start gap-8 mb-9">
    {[
      { num: '1', text: 'Add a job &\nyour resume' },
      { num: '2', text: 'Get fit score\n& questions' },
      { num: '3', text: 'Practice with\nAI interview', highlight: true },
    ].map((step, i) => (
      <Fragment key={i}>
        {i > 0 && <span className="text-gray-200 text-lg mt-2.5">→</span>}
        <div className="flex flex-col items-center gap-2 w-[140px]">
          <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 text-sm font-bold flex items-center justify-center border border-purple-200">
            {step.num}
          </div>
          <div className={`text-xs leading-relaxed ${step.highlight ? 'text-purple-600 font-semibold' : 'text-gray-500'}`}>
            {step.text}
          </div>
        </div>
      </Fragment>
    ))}
  </div>

  <button className="inline-flex items-center gap-2.5 px-9 py-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white text-base font-bold shadow-[0_4px_24px_rgba(124,92,252,0.18)]">
    + Add Your First Job
  </button>

  <p className="mt-3.5 text-xs text-gray-400">
    Free to start · Takes under 2 minutes
  </p>
</div>
```

---

## Phase 3: Job Card Redesign

This is the highest-impact change. Each job card needs to show interview status and provide a direct action button.

### 3.1 Create the new JobCard component

Create: `components/jobs/JobCard.tsx` (or update the existing one)

**Design reference**: See the job cards in the "3 Jobs (Active)" tab.

```typescript
interface JobCardProps {
  job: DashboardJob
  onStartInterview: (jobId: string) => void
  onViewResults: (jobId: string) => void
  onRetry: (jobId: string) => void
}
```

The card has a **3-column grid layout**: `grid-cols-[1fr_auto_auto]`

**Column 1 — Job Info (left)**:
- Job title: `text-base font-bold text-gray-900 truncate`
- Meta row: company · 📄 Resume attached · Added date
- If interviews exist: **mini progress bar** showing first score → best score with improvement delta

**Column 2 — Status Indicators (middle)**:
- **Fit Score pill**: Green background for 7+, amber for <7. Shows "8/10" + "Fit" label.
- **Interview score** (if interviews exist): Large score number + "Best Score" label
- **Interview status chip**:
  - No interviews: `🎙️ Not practiced` (purple bg, purple border) + "10 questions ready"
  - Has interviews: `✓ N interviews` (green bg, green border) + "Last: 2 hours ago"

**Column 3 — Actions (right)**:
- No interviews: Single **"Start Interview"** purple button
- Has interviews: **"View Results"** secondary button + **"Retry"** purple button

**Jobs with no interviews get a purple left border** (`border-l-[3px] border-l-purple-500`) to visually flag them as needing attention.

### 3.2 Mini Progress Bar component

Only shown when `interview_count >= 2`. Shows score trajectory.

```tsx
// components/jobs/MiniProgressBar.tsx
interface MiniProgressBarProps {
  firstScore: number
  bestScore: number
  improvement: number
  interviewCount: number
}

// Layout: "3 interviews  6.8 [====bar====] 8.6  ↑ +1.8"
// Bar fill: green for positive improvement
// Tailwind: flex items-center gap-1.5 mt-2
// Bar track: w-20 h-1 rounded-full bg-gray-100
// Bar fill: h-full rounded-full bg-green-500 w-full (always full — it represents the range)
```

### 3.3 Interview Status Chip component

```tsx
// components/jobs/InterviewStatusChip.tsx
type InterviewStatus = 'none' | 'practiced'

interface InterviewStatusChipProps {
  status: InterviewStatus
  interviewCount: number
  questionsReady?: number  // e.g. 10
  lastInterviewAt?: string | null
}

// 'none': purple-50 bg, purple-500 text, purple-200 border, "🎙️ Not practiced"
//         sub: "10 questions ready"
// 'practiced': green-50 bg, green-600 text, green-200 border, "✓ N interviews"
//              sub: relative time "Last: 2 hours ago"
```

### 3.4 Card action routing

The **"Start Interview"** button should:
1. Navigate to the job detail page (where the new sidebar CTA lives) — simplest approach
2. OR trigger the interview/credits flow directly from the dashboard — more aggressive

Recommended: Navigate to job detail page. The job detail page now has the prominent sidebar CTA from the previous restructure, so the user lands right next to the interview button.

```tsx
// "Start Interview" and "Retry" → navigate to job detail page
const router = useRouter()
const handleStartInterview = (jobId: string) => router.push(`/jobs/${jobId}`)
const handleViewResults = (jobId: string) => router.push(`/jobs/${jobId}`)
const handleRetry = (jobId: string) => router.push(`/jobs/${jobId}`)

// All three go to the same page — the job detail page now handles
// showing the right state (pre-interview CTA or post-interview results + retry)
```

---

## Phase 4: Stats Row (Populated State)

### 4.1 Create the StatsRow component

Only shown when `jobs.length > 0 && totalInterviews > 0`. Don't show for users who haven't done any interviews yet.

Create: `components/jobs/StatsRow.tsx`

**Design reference**: See the stats row in the "3 Jobs (Active)" tab.

```typescript
interface StatsRowProps {
  stats: {
    totalJobs: number
    totalInterviews: number
    uniqueCompanies: number
    jobsWithInterviews: number
    overallBestScore: number | null
    bestScoreJobTitle: string | null
  }
  creditCount: number
}
```

4-column grid: `grid-cols-4` (responsive: `grid-cols-2` on mobile)

Each stat card:
- White background, 1px border, rounded-xl, light shadow
- Label: uppercase, text-[11px], tracking-wide, text-gray-400, with emoji icon
- Value: text-[28px], font-extrabold, tracking-tight
  - "Active Jobs": default text color
  - "Interviews Done": purple color
  - "Best Score": green color
  - "Credits": default, with "Buy more →" link in green as subtext
- Subtext: text-[11px], text-gray-400

**The Credits stat card doubles as a subtle purchase prompt** — the subtext "Buy more →" is a green link that navigates to billing.

---

## Phase 5: Contextual Banners

### 5.1 Nudge Banner — "You haven't practiced yet"

Only shown when: `jobs.length > 0 && totalInterviews === 0`

This catches users who added a job, got the free analysis, but never started an interview.

Create: `components/jobs/NudgeBanner.tsx`

**Design reference**: See the nudge banner in the "1 Job" tab.

```tsx
// Purple gradient background with interview icon
// Headline: "You haven't practiced yet — start your first mock interview"
// Subtext: "You have a fit score and tailored questions ready. Practice answering them with AI feedback."
// CTA button: "Start Interview →"

// The CTA should navigate to the first job that has no interviews:
const firstUnpracticedJob = jobs.find(j => j.interview_count === 0)
onClick={() => router.push(`/jobs/${firstUnpracticedJob?.id}`)}
```

Tailwind structure:
```
bg-gradient-to-br from-purple-50/60 to-blue-50/40
border border-purple-200/60
rounded-xl p-5 flex items-center gap-4 mb-5
```

### 5.2 Credits Low Banner

Only shown when: `creditCount > 0 && creditCount <= 3 && totalInterviews > 0`

(Don't show at 0 credits — that's handled by the paywall. Don't show to users who haven't interviewed yet — they don't understand credits.)

Create: `components/jobs/CreditsBanner.tsx`

**Design reference**: See the credits banner in the "3 Jobs (Active)" tab.

```tsx
// Amber background with ⚡ icon
// Text: "You have {N} credits remaining. You've been improving fast — grab more to keep the momentum."
// CTA: "Buy Credits" amber button → navigate to billing page

// Tailwind:
// bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3.5 mb-5
```

---

## Phase 6: Page Assembly & Conditional Rendering

### 6.1 Wire up the full page

The jobs page should render different layouts based on state:

```tsx
// app/jobs/page.tsx (or wherever the jobs page lives)

export default async function JobsPage() {
  const { jobs } = await getJobsWithInterviewStats()
  const creditCount = await getCreditCount() // use your existing pattern
  const stats = computeDashboardStats(jobs)

  // Determine page state
  const isEmpty = jobs.length === 0
  const hasInterviews = stats.totalInterviews > 0
  const hasUnpracticedJobs = stats.jobsWithoutInterviews > 0
  const creditsLow = creditCount > 0 && creditCount <= 3 && hasInterviews

  return (
    <div className="px-7 py-7">
      {isEmpty ? (
        // ── EMPTY STATE ──
        <EmptyState />
      ) : (
        // ── POPULATED STATE ──
        <>
          {/* Stats row: only if user has done at least 1 interview */}
          {hasInterviews && (
            <StatsRow stats={stats} creditCount={creditCount} />
          )}

          {/* Nudge banner: has jobs but no interviews */}
          {!hasInterviews && (
            <NudgeBanner firstJobId={jobs.find(j => j.interview_count === 0)?.id} />
          )}

          {/* Credits low banner */}
          {creditsLow && (
            <CreditsBanner creditCount={creditCount} />
          )}

          {/* Page header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">
              Your Jobs
            </h2>
            <Link href="/jobs/new">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold shadow-[0_2px_10px_rgba(124,92,252,0.2)]">
                + Add a Job
              </button>
            </Link>
          </div>

          {/* Job cards list */}
          <div className="flex flex-col gap-3">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
```

### 6.2 Job card ordering logic

Sort jobs to maximize conversion — put jobs that need action first:

```typescript
// Sort order:
// 1. Jobs with no interviews (needs attention — purple left border)
// 2. Jobs with interviews, sorted by last_interview_at descending (most recent first)
const sortedJobs = [...jobs].sort((a, b) => {
  // Unpracticed jobs first
  if (a.interview_count === 0 && b.interview_count > 0) return -1
  if (a.interview_count > 0 && b.interview_count === 0) return 1
  // Then by most recently active
  const aTime = a.last_interview_at ? new Date(a.last_interview_at).getTime() : new Date(a.created_at).getTime()
  const bTime = b.last_interview_at ? new Date(b.last_interview_at).getTime() : new Date(b.created_at).getTime()
  return bTime - aTime
})
```

---

## Phase 7: Polish & Edge Cases

### 7.1 Relative time formatting

The "Last: 2 hours ago" text on interview chips needs relative time formatting:

```typescript
// lib/utils/time.ts (or add to existing utils)
export function relativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
```

### 7.2 Loading state

While jobs are being fetched, show skeleton cards:

```tsx
// 3 skeleton cards with shimmer animation
<div className="flex flex-col gap-3">
  {[1, 2, 3].map(i => (
    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 h-24 animate-pulse">
      <div className="h-4 w-48 bg-gray-100 rounded mb-3" />
      <div className="h-3 w-32 bg-gray-50 rounded" />
    </div>
  ))}
</div>
```

### 7.3 Mobile responsive

- Stats row: `grid-cols-4` → `grid-cols-2` below `md`
- Job card grid: `grid-cols-[1fr_auto_auto]` → single column stack below `md`
- Nudge banner: flex row → flex column on small screens
- Buttons stack vertically on mobile

```tsx
// Job card responsive
<div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 md:gap-5 items-center">
```

### 7.4 Hover states

Job cards should have a subtle lift on hover:
```
hover:border-purple-200 hover:shadow-md hover:-translate-y-px transition-all duration-150 cursor-pointer
```

Make the entire card clickable (navigates to job detail), with the action buttons stopping propagation:

```tsx
<div
  className="job-card ..."
  onClick={() => router.push(`/jobs/${job.id}`)}
>
  {/* ... */}
  <button
    onClick={(e) => { e.stopPropagation(); handleStartInterview(job.id) }}
    className="..."
  >
    Start Interview
  </button>
</div>
```

---

## Component File Structure

```
components/
  jobs/
    EmptyState.tsx              # Phase 2
    JobCard.tsx                 # Phase 3.1
    MiniProgressBar.tsx         # Phase 3.2
    InterviewStatusChip.tsx     # Phase 3.3
    StatsRow.tsx                # Phase 4
    NudgeBanner.tsx             # Phase 5.1
    CreditsBanner.tsx           # Phase 5.2

lib/
  queries/
    dashboard.ts               # Phase 1.1, 1.2
  utils/
    time.ts                    # Phase 7.1 (or add to existing utils)
```

---

## Color Reference (Tailwind classes)

Consistent with the job detail page restructure:

| Element | Tailwind Classes |
|---------|-----------------|
| Purple CTA button | `bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-[0_4px_24px_rgba(124,92,252,0.18)]` |
| Secondary button | `bg-gray-50 text-gray-700 border border-gray-200` |
| Fit pill (high) | `bg-green-50 border border-green-200 text-green-600` |
| Fit pill (mid) | `bg-amber-50 border border-amber-200 text-amber-600` |
| Interview chip (none) | `bg-purple-50 border border-purple-200 text-purple-600` |
| Interview chip (done) | `bg-green-50 border border-green-200 text-green-600` |
| Unpracticed job border | `border-l-[3px] border-l-purple-500` |
| Nudge banner bg | `bg-gradient-to-br from-purple-50/60 to-blue-50/40 border border-purple-200/60` |
| Credits banner bg | `bg-amber-50 border border-amber-200` |
| Credits badge (nav) | `bg-purple-50 border border-purple-200 text-purple-600` |
| Card hover | `hover:border-purple-200 hover:shadow-md hover:-translate-y-px` |

---

## Implementation Order

Execute in this order for a working page at each step:

1. **Phase 0** — Read the codebase, map the current page and data patterns
2. **Phase 1** — Build the data query (jobs + interview stats aggregation)
3. **Phase 2** — Replace empty state with interview-focused version
4. **Phase 3** — Build the new JobCard component with interview status
5. **Phase 6** — Wire up conditional rendering on the page (empty vs populated)
6. **Test**: Verify the page renders correctly with existing job data
7. **Phase 4** — Add the stats row (only shows after user has interviews)
8. **Phase 5** — Add nudge banner and credits banner
9. **Phase 7** — Loading states, mobile responsive, hover effects, relative time
10. **Final test**: Check all 3 states (empty, 1 job no interviews, multi-job with interviews)

---

## Testing Checklist

- [ ] Empty state shows interview-focused hero with 3-step flow (NOT briefcase icon)
- [ ] Empty state CTA says "+ Add Your First Job" and navigates to job creation
- [ ] Job card shows title, company, date, resume status
- [ ] Job card shows fit score pill (green for 7+, amber for <7)
- [ ] Job card with NO interviews shows "🎙️ Not practiced" chip + "Start Interview" button
- [ ] Job card with NO interviews has a purple left border
- [ ] Job card with interviews shows "✓ N interviews" chip + best score + "View Results" and "Retry" buttons
- [ ] Job card with 2+ interviews shows mini progress bar (first score → best score → improvement)
- [ ] Stats row only appears when user has done at least 1 interview
- [ ] Stats row shows: Active Jobs, Interviews Done (purple), Best Score (green), Credits
- [ ] Nudge banner appears when user has jobs but no interviews
- [ ] Nudge banner CTA navigates to the first unpracticed job
- [ ] Credits low banner appears when 1-3 credits remaining AND user has done interviews
- [ ] Jobs are sorted: unpracticed first, then by most recently active
- [ ] Entire job card is clickable (navigates to job detail)
- [ ] Action buttons (Start Interview, Retry) stop click propagation
- [ ] Loading state shows skeleton cards while data fetches
- [ ] Mobile: stats row collapses to 2-column grid
- [ ] Mobile: job card collapses to single column stack
- [ ] Relative time displays correctly ("2h ago", "Yesterday", "Feb 8")
- [ ] All existing functionality still works (add job, navigate to job detail)
