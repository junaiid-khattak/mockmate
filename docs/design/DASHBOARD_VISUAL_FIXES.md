# Visual Fix Prompt — Jobs Dashboard

## Context

The jobs dashboard has been implemented but doesn't match the design reference (`docs/design/nayld-dashboard-redesign.html`). Open that HTML file in a browser, click the **"3 Jobs (Active)"** tab, and use it as the source of truth for every visual detail below.

This prompt lists every visual discrepancy between the current implementation and the design. Fix each one. Do NOT change functionality — only fix the visual styling.

---

## FIX 1: Fit Score Pills — Wrong Color for 7/10

**Current (WRONG):** The fit score pills for "Senior Software Engineer" (7/10) and "Senior Software Engineer Node/AWS" (7/10) are both GREEN.

**Design (CORRECT):** Scores below 8 should be AMBER. Only scores 8+ should be green.

**Fix:**
- Fit score >= 8 → green background `bg-green-50`, green border `border-green-200`, green text `text-green-600`
- Fit score < 8 → amber background `bg-amber-50`, amber border `border-amber-200`, amber text `text-amber-600`

Apply this logic wherever the fit score pill is rendered. The two 7/10 jobs should show amber pills, the 8/10 job should show green.

---

## FIX 2: "Buy Credits" Button — Wrong Color

**Current (WRONG):** The "Buy Credits" button in the credits low banner is bright red/orange (`bg-red-500` or `bg-orange-500`).

**Design (CORRECT):** The button should be amber: `bg-amber-600 text-white` (hex `#d97706`).

**Fix:** Change the button's background class to `bg-amber-600 hover:bg-amber-700 text-white`. The whole credits banner uses amber theming — the button should match.

---

## FIX 3: Best Score Stat — Decimal Styling

**Current (WRONG):** The "7.8" value in the Best Score stat card has the decimal point and fraction styled differently (looks like the "." is smaller or the digits after the decimal are a different size/subscript).

**Design (CORRECT):** The entire number "7.8" should be one consistent font-size and weight — `text-[28px] font-extrabold tracking-tight text-green-600`. No special decimal formatting, no subscript, no separate styling for the period or fractional part.

**Fix:** Render the score as a single `<span>` with uniform styling:
```tsx
<span className="text-[28px] font-extrabold tracking-tight leading-none text-green-600">
  {score.toFixed(1)}
</span>
```
Do NOT split the number into separate spans for the integer and decimal parts. It should look identical to the "3", "4", and "2" in the other stat cards — just in green and with a decimal.

---

## FIX 4: Stat Card Styling — Borders & Shadows

**Current:** Stat cards may have slightly wrong border color or missing subtle shadow.

**Design:**
- Background: `bg-white`
- Border: `border border-gray-200` (the design uses `#e8e8ef` which maps to ~`border-gray-200`)
- Border radius: `rounded-xl` (12px)
- Shadow: `shadow-sm` (very subtle — `0 1px 3px rgba(0,0,0,0.04)`)
- Padding: `px-5 py-[18px]`

**Stat label styling:**
- Font: `text-[11px] font-semibold uppercase tracking-wide text-gray-400`
- Has an emoji icon before the text
- Margin below: `mb-2`

**Stat value styling:**
- Font: `text-[28px] font-extrabold tracking-tight leading-none`
- Default color: `text-gray-900`
- "Interviews Done" value: `text-purple-600` (the specific purple is `#7c5cfc`)
- "Best Score" value: `text-green-600` (the specific green is `#16a34a`)

**Stat subtext:**
- Font: `text-[11px] text-gray-400 mt-1`
- "Buy more →" link in Credits card: `text-green-600 font-semibold` and should be clickable (links to billing)

---

## FIX 5: Credits Banner — Background & Border

**Current:** The banner background might be too saturated or the wrong shade.

**Design:**
- Background: `rgba(217, 119, 6, 0.07)` — this is a VERY subtle amber tint, almost transparent. In Tailwind: `bg-amber-50` or `bg-amber-500/[0.07]`
- Border: `border border-amber-200` (the design uses `rgba(217, 119, 6, 0.15)`)
- Border radius: `rounded-xl` (12px)
- Padding: `px-5 py-3.5`
- Layout: `flex items-center gap-3.5`

**Banner text styling:**
- Font: `text-[13px] text-gray-700`
- "2 credits" within the text: `font-bold text-amber-600`

**Banner button:**
- Padding: `px-[18px] py-2`
- Border radius: `rounded-lg` (8px)
- Background: `bg-amber-600 text-white` (NOT red, NOT orange-500)
- Font: `text-xs font-semibold`
- No border, cursor-pointer

---

## FIX 6: Job Card Layout — Grid Structure

**Current:** Cards might have slightly wrong internal spacing or alignment.

**Design:** Each job card uses a 3-column CSS grid:
```
grid-template-columns: 1fr auto auto
```

- **Padding:** `px-6 py-5` (24px horizontal, 20px vertical)
- **Gap:** `gap-5` (20px between columns)
- **Border:** `border border-gray-200` (`#e8e8ef`)
- **Border radius:** `rounded-xl` (12px)
- **Shadow:** `shadow-sm`
- **Hover:** `hover:border-purple-200 hover:shadow-md hover:-translate-y-px transition-all duration-150`
- **Align items:** `items-center` (vertically centers all 3 columns)

**For unpracticed jobs ONLY** — the purple left border:
- `border-l-[3px] border-l-purple-500`
- This should be subtle — just 3px wide, not thicker

---

## FIX 7: Fit Score Pill — Internal Structure

**Current:** The pill might have wrong internal spacing or the "FIT" label is too large.

**Design:**
```
Container: inline-flex flex-col items-center px-3.5 py-2 rounded-lg
Score text: text-lg font-extrabold (e.g. "8/10")
Label text: text-[10px] font-semibold uppercase tracking-wide (e.g. "FIT")
```

The score and label should be stacked vertically, centered. The pill should be compact — roughly 56px wide, not stretched.

Green variant (score >= 8):
- Background: `bg-green-50` (very subtle green, `rgba(22, 163, 74, 0.08)`)
- Border: `border border-green-200` (`rgba(22, 163, 74, 0.15)`)
- Text: `text-green-600` (`#16a34a`)

Amber variant (score < 8):
- Background: `bg-amber-50` (`rgba(217, 119, 6, 0.07)`)
- Border: `border border-amber-200` (`rgba(217, 119, 6, 0.15)`)
- Text: `text-amber-600` (`#d97706`)

---

## FIX 8: Interview Status Chip

**Current:** May have wrong padding, border-radius, or font size.

**Design — "Not practiced" chip:**
```
Container: inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
Background: bg-purple-50 (rgba(124, 92, 252, 0.06))
Border: border border-purple-200 (rgba(124, 92, 252, 0.18))
Text: text-xs font-semibold text-purple-600
Content: "🎙️ Not practiced"
```
Below it: `text-[10px] text-gray-400` — "10 questions ready"

**Design — "✓ N interviews" chip:**
```
Container: inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
Background: bg-green-50 (rgba(22, 163, 74, 0.08))
Border: border border-green-200 (rgba(22, 163, 74, 0.15))
Text: text-xs font-semibold text-green-600
Content: "✓ 4 interviews"
```
Below it: `text-[10px] text-gray-400` — "Last: 2h ago"

Key: `rounded-full` — the chip should be fully rounded (pill shape), NOT `rounded-lg`.

---

## FIX 9: Action Buttons

**Current:** May have slightly wrong sizes or the gradient is missing from the primary button.

**Design — Primary button ("Start Interview", "Retry"):**
```
px-5 py-2.5 rounded-lg
background: bg-gradient-to-br from-purple-500 to-purple-700
text: text-white text-[13px] font-semibold
shadow: shadow-[0_2px_10px_rgba(124,92,252,0.2)]
```
NOTE: It's a **gradient** background, not a flat `bg-purple-600`. The gradient goes from `#7c5cfc` to `#6341e0`.

**Design — Secondary button ("View Results"):**
```
px-5 py-2.5 rounded-lg
background: bg-gray-50
border: border border-gray-200
text: text-gray-700 text-[13px] font-semibold
```

Both buttons should be the same height and sit side-by-side with `gap-2.5` between them.

---

## FIX 10: Mini Progress Bar (on practiced job card)

**Current:** Layout might be slightly off.

**Design:** The progress bar appears on the bottom-left of practiced job cards, below the meta row:
```
Container: flex items-center gap-1.5 mt-2
"4 interviews" label: text-[10px] text-gray-400, with fixed width ~60px
First score: text-[10px] text-gray-400 (e.g. "3.5")
Bar track: w-20 h-1 rounded-full bg-gray-100 overflow-hidden
Bar fill: h-full rounded-full bg-green-500 w-full (always fills 100% — represents the range)
Best score: text-[10px] font-bold text-green-600 (e.g. "7.8")
Delta: text-[10px] font-semibold text-green-600 (e.g. "↑ +4.3")
```

---

## FIX 11: "Your Jobs" Header

**Current:** May be slightly off in size or weight.

**Design:**
```
Container: flex items-center justify-between mb-5
"Your Jobs": text-[22px] font-extrabold text-gray-900 tracking-tight
"+ Add a Job" button: inline-flex items-center gap-2 px-[22px] py-2.5 rounded-lg
  bg-purple-600 text-white text-sm font-semibold
  shadow-[0_2px_10px_rgba(124,92,252,0.2)]
```

---

## FIX 12: Best Score Display (on practiced job card)

**Current:** The large "7.8" score in the middle column of the practiced job card might have wrong styling.

**Design:**
```
Container: text-center
Score: text-[22px] font-extrabold leading-none text-green-600
Label: text-[10px] text-gray-400 mt-0.5 — "Best Score"
```

Again — the score number should NOT have separate styling for integer vs decimal. Render the full number as one styled span.

---

## FIX 13: Job Card Sorting

**Design:** Jobs should be sorted with unpracticed jobs FIRST (they need attention), then practiced jobs sorted by most recent activity.

Check that the sort order is: unpracticed jobs at top, practiced at bottom. In the screenshot, this appears correct already (the two unpracticed jobs are at top), so just verify.

---

## Summary: Priority Order

Fix these in order of visual impact:

1. **FIX 1** — Fit pills wrong color (7/10 should be amber, not green)
2. **FIX 2** — Buy Credits button wrong color (should be amber, not red)
3. **FIX 3** — Best Score decimal styling (remove split styling, use one span)
4. **FIX 9** — Primary buttons need gradient (from-purple-500 to-purple-700, not flat)
5. **FIX 5** — Credits banner background too saturated
6. **FIX 7** — Fit pill internal structure (compact, stacked)
7. **FIX 8** — Interview chips need rounded-full
8. **FIX 4** — Stat card border/shadow refinement
9. **FIX 6** — Job card grid spacing
10. **FIX 10** — Progress bar sizing
11. **FIX 11** — Header sizing
12. **FIX 12** — Best score display on card

After making all fixes, open the design reference HTML side-by-side with localhost and visually verify each element matches.
