# nayld.ai — Interview Screen Redesign Implementation Plan

## For: Claude Code
## Stack: Next.js (React) · Tailwind CSS · Supabase
## Design Reference: `nayld-interview-redesign.html`

---

## Overview

Redesign the live interview screen from the current light, card-based layout into an immersive dark fullscreen experience. The screen should feel like a recording studio / mission control — dark background, animated audio visualization, contextual color shifts based on who is speaking, and a custom AI avatar mark.

**Design reference**: Open `nayld-interview-redesign.html` in a browser. It has 5 interactive states you can toggle at the top. The current implementation likely lives at a route like `/interview/[id]` or `/jobs/[id]/interview`. Find it first.

**CRITICAL**: This is a visual overhaul of an existing functional page. The audio/WebRTC/microphone/AI logic MUST NOT be touched. You are reskinning the UI layer only. Preserve every existing event handler, state variable, API call, and audio connection. Only change the JSX, CSS, and visual components.

---

## Phase 0: Understand Current Implementation

Before writing any code, map the existing interview page:

```bash
# Find the interview page/component
find . -type f -name "*.tsx" -o -name "*.jsx" | xargs grep -l "Interview Live\|interview.*live\|End Interview\|Mute\|interviewer will start" | head -20

# Find the interview route
find . -path "*/interview*" -name "page.tsx" -o -path "*/interview*" -name "page.jsx" | head -10

# Find audio/WebRTC/mic logic
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "getUserMedia\|AudioContext\|WebRTC\|microphone\|MediaStream\|RTCPeer" | head -20

# Find interview state management (connecting, speaking, etc.)
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "INTERVIEW_LIVE\|interview.*status\|isConnecting\|isSpeaking\|interviewState" | head -20

# Check what CSS/styling currently exists on the interview page
find . -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "interview.*className\|Interview.*style" | head -20
```

Map out:
- The **interview page component** and its file path
- The **state variables** that track interview phase (connecting, live, AI speaking, user speaking, processing, ended)
- The **audio/mic hooks** or functions (these must NOT be modified)
- The **timer logic** (elapsed time counter)
- The **mute toggle** handler
- The **end interview** handler
- The **job title and attempt number** — how they're passed to the page
- Any **WebSocket or streaming** connections for real-time AI responses

---

## Phase 1: Fonts & Global Setup

### 1.1 Add Instrument Sans + JetBrains Mono fonts

The design uses two fonts:
- **Instrument Sans** — primary UI font (body text, buttons, status text)
- **JetBrains Mono** — monospace accent (timer, badges, labels)

Add to your font loading (likely in `layout.tsx` or `globals.css`):

```tsx
// In next.config or layout.tsx — Google Fonts import
import { Instrument_Sans, JetBrains_Mono } from 'next/font/google'

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
})
```

If you can't modify the global font setup, apply the fonts locally on the interview page only using `@import` in a CSS module or inline style tag.

### 1.2 Color tokens

Add these CSS variables (either globally or scoped to the interview page). These are the ONLY colors used in the entire interview screen:

```css
/* Interview screen color tokens */
--iv-bg-deep: #06080f;
--iv-bg-card: rgba(14, 20, 36, 0.7);
--iv-bg-card-solid: #0e1424;
--iv-border: rgba(255, 255, 255, 0.06);
--iv-border-active: rgba(255, 255, 255, 0.12);
--iv-text: #e8eaf0;
--iv-text-dim: rgba(255, 255, 255, 0.5);
--iv-text-muted: rgba(255, 255, 255, 0.3);
--iv-cyan: #22d3ee;
--iv-cyan-dim: rgba(34, 211, 238, 0.15);
--iv-cyan-glow: rgba(34, 211, 238, 0.25);
--iv-green: #34d399;
--iv-green-dim: rgba(52, 211, 153, 0.15);
--iv-red: #f87171;
--iv-red-dim: rgba(248, 113, 113, 0.15);
--iv-amber: #fbbf24;
--iv-purple: #a78bfa;
```

---

## Phase 2: Fullscreen Dark Canvas

The interview screen takes over the entire viewport. No navbar, no sidebar, no page chrome.

### 2.1 Page container

```tsx
// The outermost wrapper
<div className="fixed inset-0 bg-[#06080f] flex flex-col font-sans text-[#e8eaf0]">
  <AmbientBackground />
  <TopBar />
  <MainArea />
  <BottomBar />
</div>
```

The page must:
- Use `position: fixed; inset: 0` to cover the full viewport
- Hide any parent navbar/layout chrome (the interview is a standalone fullscreen experience)
- Set `overflow: hidden` on body when this page mounts, restore on unmount

```tsx
useEffect(() => {
  document.body.style.overflow = 'hidden';
  return () => { document.body.style.overflow = ''; };
}, []);
```

### 2.2 AmbientBackground component

Create: `components/interview/AmbientBackground.tsx`

This is a purely decorative layer behind all content. It creates depth and atmosphere.

```tsx
export function AmbientBackground({ colorMode = 'cyan' }) {
  // colorMode: 'cyan' (AI states), 'green' (user speaking), 'purple' (thinking)
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 40%, black 20%, transparent 100%)',
        }}
      />

      {/* Floating orbs — color shifts based on mode */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[100px] -top-[10%] left-[20%] animate-[orbFloat_12s_ease-in-out_infinite]"
        style={{ background: colorMode === 'green' ? 'rgba(52,211,153,0.06)' : colorMode === 'purple' ? 'rgba(167,139,250,0.06)' : 'rgba(34,211,238,0.06)' }}
      />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[100px] -bottom-[10%] right-[10%] animate-[orbFloat_12s_ease-in-out_infinite] [animation-delay:-4s]"
        style={{ background: 'rgba(167,139,250,0.04)' }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0"
        style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }}
      />
    </div>
  );
}
```

Add the `orbFloat` keyframes to your global CSS or Tailwind config:

```css
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}
```

---

## Phase 3: Top Bar

Create: `components/interview/InterviewTopBar.tsx`

### 3.1 Layout

```tsx
<div className="relative z-10 flex items-center justify-between px-8 pt-5">
  <div className="flex items-center gap-4">
    <SessionInfo jobTitle={jobTitle} attemptNumber={attemptNumber} />
  </div>
  <div className="flex items-center gap-3">
    <LiveBadge status={interviewStatus} />
    <Timer elapsed={elapsedSeconds} />
  </div>
</div>
```

### 3.2 SessionInfo

```tsx
// Job title + meta
<div>
  <h2 className="text-[15px] font-semibold text-[#e8eaf0] tracking-tight">
    {jobTitle}
  </h2>
  <div className="flex items-center gap-2.5 mt-0.5 text-xs text-white/30">
    <span>Mock Interview</span>
    <div className="w-[3px] h-[3px] rounded-full bg-white/15" />
    <span>Attempt #{attemptNumber}</span>
  </div>
</div>
```

### 3.3 LiveBadge

Two visual states based on interview connection status:

```tsx
function LiveBadge({ status }: { status: 'connecting' | 'live' }) {
  const isConnecting = status === 'connecting';

  return (
    <div className={`
      inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
      font-mono text-[11px] font-semibold uppercase tracking-wide
      ${isConnecting
        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
        : 'bg-red-400/15 text-red-400 border border-red-400/20'
      }
    `}>
      <div className={`
        w-1.5 h-1.5 rounded-full
        ${isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-red-400 animate-pulse'}
      `} />
      {isConnecting ? 'Connecting' : 'Live'}
    </div>
  );
}
```

**IMPORTANT**: The `animate-pulse` here is a custom pulse — the design uses:
```css
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
```
Add this keyframe and use `animate-[livePulse_1.5s_ease-in-out_infinite]` instead of Tailwind's default `animate-pulse`.

### 3.4 Timer

```tsx
function Timer({ elapsed }: { elapsed: number }) {
  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div className="font-mono text-sm font-medium text-white/50 bg-[rgba(14,20,36,0.7)] border border-white/[0.06] px-4 py-1.5 rounded-lg tracking-wider">
      {mins}:{secs}
    </div>
  );
}
```

**NOTE**: The existing timer logic should already provide `elapsed` seconds. Wire this component to the existing timer state. Do NOT create a new timer.

---

## Phase 4: Central Avatar + Rings

This is the visual centerpiece. Create: `components/interview/AvatarOrb.tsx`

### 4.1 The avatar has 4 visual modes:

| Mode | Core Content | Ring Animation | Ring Color | Core Border |
|------|-------------|----------------|------------|-------------|
| `connecting` | Spinning loader | Slow gentle pulse | Cyan 10% | Cyan 20% |
| `ai-speaking` | AI mark SVG | Fast rhythmic pulse | Cyan 25% | Cyan 40% + glow |
| `user-speaking` | Mic SVG | Medium pulse | Green 25% | Green 30% + glow |
| `thinking` | Bouncing dots | Slow gentle pulse | Default (cyan 10%) | Purple 25% + glow |

### 4.2 Ring component

3 concentric rings around the core, each larger and more transparent:

```tsx
function AvatarRings({ mode }: { mode: string }) {
  const ringClass = mode === 'ai-speaking' ? 'speaking'
    : mode === 'user-speaking' ? 'user-speaking'
    : '';

  return (
    <>
      <div className={`avatar-ring ${ringClass}`} />      {/* inset: 0 */}
      <div className={`avatar-ring ${ringClass}`} />      {/* inset: -16px */}
      <div className={`avatar-ring ${ringClass}`} />      {/* inset: -32px */}
    </>
  );
}
```

The ring animations MUST be done in CSS (not JS) for performance. Add these keyframes:

```css
/* Default idle pulse */
.avatar-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid rgba(34, 211, 238, 0.1);
  animation: ringPulse 3s ease-in-out infinite;
}
.avatar-ring:nth-child(2) { inset: -16px; border-color: rgba(34, 211, 238, 0.06); animation-delay: -0.5s; animation-duration: 3.5s; }
.avatar-ring:nth-child(3) { inset: -32px; border-color: rgba(34, 211, 238, 0.03); animation-delay: -1s; animation-duration: 4s; }

@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: 0.6; }
}

/* AI speaking — faster, more visible */
.avatar-ring.speaking { border-color: rgba(34, 211, 238, 0.25); animation: ringSpeaking 1.2s ease-in-out infinite; }
.avatar-ring.speaking:nth-child(2) { border-color: rgba(34, 211, 238, 0.15); animation-delay: -0.2s; }
.avatar-ring.speaking:nth-child(3) { border-color: rgba(34, 211, 238, 0.08); animation-delay: -0.4s; }

@keyframes ringSpeaking {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
}

/* User speaking — green, medium speed */
.avatar-ring.user-speaking { border-color: rgba(52, 211, 153, 0.25); animation: ringUser 0.8s ease-in-out infinite; }
.avatar-ring.user-speaking:nth-child(2) { border-color: rgba(52, 211, 153, 0.12); animation-delay: -0.15s; }
.avatar-ring.user-speaking:nth-child(3) { border-color: rgba(52, 211, 153, 0.06); animation-delay: -0.3s; }

@keyframes ringUser {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.06); opacity: 1; }
}
```

### 4.3 Avatar core

```tsx
function AvatarCore({ mode }: { mode: string }) {
  const coreStyles = {
    connecting: 'border-cyan-400/20 shadow-[0_0_60px_rgba(34,211,238,0.1),inset_0_0_30px_rgba(34,211,238,0.05)]',
    'ai-speaking': 'border-cyan-400/40 shadow-[0_0_80px_rgba(34,211,238,0.2),inset_0_0_30px_rgba(34,211,238,0.08)]',
    'user-speaking': 'border-emerald-400/30 shadow-[0_0_60px_rgba(52,211,153,0.1),inset_0_0_30px_rgba(52,211,153,0.05)]',
    thinking: 'border-purple-400/25 shadow-[0_0_60px_rgba(167,139,250,0.1),inset_0_0_30px_rgba(167,139,250,0.05)]',
  };

  return (
    <div className={`
      w-[120px] h-[120px] rounded-full relative z-[2]
      bg-gradient-to-br from-[#0e1424] to-[rgba(14,20,36,0.9)]
      border flex items-center justify-center
      ${coreStyles[mode] || coreStyles.connecting}
    `}>
      {mode === 'connecting' && <ConnectingSpinner />}
      {mode === 'ai-speaking' && <AIMarkSVG />}
      {mode === 'user-speaking' && <MicSVG />}
      {mode === 'thinking' && <ThinkingDots />}
    </div>
  );
}
```

### 4.4 AI Mark SVG

This is the custom warm AI icon — three overlapping translucent circles with a bright center:

```tsx
function AIMarkSVG() {
  return (
    <div className="w-[52px] h-[52px] relative flex items-center justify-center">
      {/* Glow behind */}
      <div className="absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25)_0%,transparent_70%)] animate-[markGlow_1.2s_ease-in-out_infinite]" />
      <svg viewBox="0 0 52 52" fill="none" className="w-[52px] h-[52px]">
        <circle cx="26" cy="18" r="8" fill="rgba(34,211,238,0.18)" stroke="rgba(34,211,238,0.45)" strokeWidth="1"/>
        <circle cx="18" cy="30" r="8" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
        <circle cx="34" cy="30" r="8" fill="rgba(34,211,238,0.12)" stroke="rgba(34,211,238,0.35)" strokeWidth="1"/>
        <circle cx="26" cy="26" r="5" fill="rgba(34,211,238,0.85)">
          <animate attributeName="r" values="5;6.5;5" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="26" cy="12" r="2" fill="#22d3ee" opacity="0.6">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="14" cy="34" r="2" fill="#22d3ee" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="38" cy="34" r="2" fill="#22d3ee" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.8;0.4" dur="1.6s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}
```

Add keyframe:
```css
@keyframes markGlow {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
```

### 4.5 Mic SVG (user speaking)

```tsx
function MicSVG() {
  return (
    <div className="w-11 h-11 flex items-center justify-center">
      <svg viewBox="0 0 44 44" fill="none" className="w-11 h-11">
        <rect x="16" y="8" width="12" height="18" rx="6" fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.6)" strokeWidth="1.5"/>
        <path d="M12 24c0 6.627 5.373 12 12 12h0c6.627 0 12-5.373 12-12" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <line x1="22" y1="36" x2="22" y2="40" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="22" cy="17" r="2" fill="#34d399" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="0.8s" repeatCount="indefinite"/>
        </circle>
      </svg>
    </div>
  );
}
```

### 4.6 ConnectingSpinner + ThinkingDots

```tsx
function ConnectingSpinner() {
  return (
    <div className="w-12 h-12 rounded-full border-2 border-cyan-400/10 border-t-cyan-400 animate-spin" />
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-purple-400 animate-[thinkBounce_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
```

Add keyframe:
```css
@keyframes thinkBounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-10px); opacity: 1; }
}
```

---

## Phase 5: Waveform Visualization

Create: `components/interview/Waveform.tsx`

The waveform is a row of 48 thin vertical bars that animate to simulate audio.

### 5.1 Three modes:

| Mode | Bar Color | Animation | Bar Heights |
|------|-----------|-----------|-------------|
| `idle` | Cyan 20% opacity | None | All 4px (flat line) |
| `ai-active` | Cyan 100% | `waveAnim` at randomized speeds | Random 6–42px |
| `user-active` | Green 100% | `waveAnim` at faster randomized speeds | Random 6–44px |

### 5.2 Implementation

```tsx
function Waveform({ mode }: { mode: 'idle' | 'ai-active' | 'user-active' }) {
  const bars = useMemo(() => {
    return Array.from({ length: 48 }, (_, i) => ({
      height: mode === 'idle' ? 4 : 6 + Math.random() * 36,
      delay: -(Math.random() * 1.5),
      duration: mode === 'user-active'
        ? 0.4 + Math.random() * 0.6
        : 0.5 + Math.random() * 0.8,
    }));
  }, [mode]);

  const barColor = mode === 'user-active' ? '#34d399' : '#22d3ee';

  return (
    <div className="flex items-center justify-center gap-[3px] h-12 mb-8">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: bar.height + 'px',
            background: barColor,
            opacity: mode === 'idle' ? 0.2 : 1,
            animation: mode === 'idle' ? 'none' : `waveAnim ${bar.duration}s ease-in-out ${bar.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
```

Add keyframe:
```css
@keyframes waveAnim {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
```

**NOTE**: If the existing implementation already has audio level data (e.g. from an `AnalyserNode`), you can wire the bar heights to real audio amplitude instead of random values. This would make the waveform reactive to actual speech. But the random animation approach works well as a baseline.

---

## Phase 6: Status Text

Create: `components/interview/StatusText.tsx`

Displayed below the waveform. Changes based on interview state.

```tsx
interface StatusTextProps {
  mode: InterviewMode;
  statusMessage?: string; // optional override from the AI/WebSocket
}

function StatusText({ mode, statusMessage }: StatusTextProps) {
  const config = {
    connecting: {
      labelColor: 'text-amber-400',
      label: 'Preparing Session',
      text: 'Setting up your interview environment...',
      subtext: 'Requesting microphone access',
    },
    'ai-speaking': {
      labelColor: 'text-cyan-400',
      label: 'AI Interviewer Speaking',
      text: statusMessage || 'Listen carefully — the interviewer is asking you a question.',
    },
    'user-speaking': {
      labelColor: 'text-emerald-400',
      label: 'Your Turn — Speaking',
      text: 'Take your time. The AI interviewer is listening and will follow up when you\'re done.',
    },
    thinking: {
      labelColor: 'text-purple-400',
      label: 'Processing Your Answer',
      text: 'Analyzing your response and preparing a follow-up question...',
    },
  };

  const c = config[mode] || config.connecting;

  return (
    <div className="text-center mb-10">
      <div className={`font-mono text-[10px] font-semibold tracking-[2px] uppercase mb-2 ${c.labelColor}`}>
        {c.label}
      </div>
      <div className="text-lg font-medium text-[#e8eaf0] tracking-tight leading-relaxed max-w-[500px] mx-auto">
        {c.text}
      </div>
      {c.subtext && (
        <div className="text-[13px] text-white/30 mt-1.5">{c.subtext}</div>
      )}
    </div>
  );
}
```

---

## Phase 7: Bottom Controls

Create: `components/interview/InterviewControls.tsx`

Just two buttons centered at the bottom: Mute and End Interview.

```tsx
function InterviewControls({ isMuted, onToggleMute, onEndInterview }) {
  return (
    <div className="relative z-10 px-8 pb-7 flex items-center justify-center gap-4">
      <button
        onClick={onToggleMute}
        className={`
          flex items-center justify-center gap-2 px-7 py-3.5 rounded-[14px]
          font-sans text-sm font-semibold tracking-tight
          transition-all duration-200 cursor-pointer
          ${isMuted
            ? 'bg-red-400/15 border border-red-400/20 text-red-400'
            : 'bg-[rgba(14,20,36,0.7)] border border-white/[0.06] text-[#e8eaf0] hover:border-white/[0.12] hover:bg-white/[0.06]'
          }
        `}
      >
        <span className="text-lg leading-none">{isMuted ? '🔇' : '🎤'}</span>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>

      <button
        onClick={onEndInterview}
        className="
          flex items-center justify-center gap-2 px-7 py-3.5 rounded-[14px]
          bg-red-400/[0.12] border border-red-400/20 text-red-400
          font-sans text-sm font-semibold tracking-tight
          transition-all duration-200 cursor-pointer
          hover:bg-red-400/20
        "
      >
        <span className="text-lg leading-none">✕</span>
        End Interview
      </button>
    </div>
  );
}
```

**CRITICAL**: Wire `onToggleMute` and `onEndInterview` to the EXISTING handlers. Do not create new logic. These buttons are a visual replacement for the current "Mute" and "End Interview" buttons.

---

## Phase 8: State Mapping

The existing interview page likely has state that maps to visual modes. Create a mapping function:

```tsx
type InterviewMode = 'connecting' | 'ai-speaking' | 'user-speaking' | 'thinking';

function getInterviewMode(state: ExistingInterviewState): InterviewMode {
  // Map your existing state to the 4 visual modes
  // This will depend on your current state shape. Examples:

  // If you have a status string:
  if (state.status === 'connecting' || state.status === 'preparing') return 'connecting';
  if (state.status === 'ai_speaking' || state.isAISpeaking) return 'ai-speaking';
  if (state.status === 'user_speaking' || state.isUserSpeaking) return 'user-speaking';
  if (state.status === 'processing' || state.isThinking) return 'thinking';

  // Default
  return 'connecting';
}
```

### 8.1 Wire mode to all components

```tsx
// In the interview page component
const mode = getInterviewMode(interviewState);

// Ambient background shifts color
const ambientColor = mode === 'user-speaking' ? 'green' : mode === 'thinking' ? 'purple' : 'cyan';

// Waveform mode
const waveMode = mode === 'ai-speaking' ? 'ai-active' : mode === 'user-speaking' ? 'user-active' : 'idle';

// Live badge status
const badgeStatus = mode === 'connecting' ? 'connecting' : 'live';
```

---

## Phase 9: Full Page Assembly

```tsx
export default function InterviewPage() {
  // === EXISTING STATE AND LOGIC (DO NOT MODIFY) ===
  const { interviewState, isMuted, toggleMute, endInterview, elapsedSeconds, jobTitle, attemptNumber } = useExistingInterviewHook();

  // === NEW VISUAL MAPPING ===
  const mode = getInterviewMode(interviewState);
  const ambientColor = mode === 'user-speaking' ? 'green' : mode === 'thinking' ? 'purple' : 'cyan';
  const waveMode = mode === 'ai-speaking' ? 'ai-active' : mode === 'user-speaking' ? 'user-active' : 'idle';
  const badgeStatus = mode === 'connecting' ? 'connecting' : 'live';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#06080f] flex flex-col">
      <AmbientBackground colorMode={ambientColor} />

      <InterviewTopBar
        jobTitle={jobTitle}
        attemptNumber={attemptNumber}
        badgeStatus={badgeStatus}
        elapsedSeconds={elapsedSeconds}
      />

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-8">
        <AvatarOrb mode={mode} />
        <Waveform mode={waveMode} />
        <StatusText mode={mode} />
      </div>

      <InterviewControls
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onEndInterview={endInterview}
      />
    </div>
  );
}
```

---

## Component File Structure

```
components/
  interview/
    AmbientBackground.tsx    # Phase 2.2
    InterviewTopBar.tsx      # Phase 3 (contains SessionInfo, LiveBadge, Timer)
    AvatarOrb.tsx            # Phase 4 (contains AvatarRings, AvatarCore, AIMarkSVG, MicSVG, etc.)
    Waveform.tsx             # Phase 5
    StatusText.tsx           # Phase 6
    InterviewControls.tsx    # Phase 7

styles/
  interview.css              # All keyframe animations (or add to globals.css)
```

---

## Required CSS Keyframes

Add ALL of these to your CSS. They can go in a single `interview.css` file or in `globals.css`:

```css
/* Ambient orb floating */
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(0.95); }
}

/* Avatar ring — idle */
@keyframes ringPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.04); opacity: 0.6; }
}

/* Avatar ring — AI speaking */
@keyframes ringSpeaking {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
}

/* Avatar ring — user speaking */
@keyframes ringUser {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.06); opacity: 1; }
}

/* Live badge pulse */
@keyframes livePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}

/* AI mark glow */
@keyframes markGlow {
  0%, 100% { opacity: 0.7; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}

/* Waveform bars */
@keyframes waveAnim {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}

/* Thinking dots bounce */
@keyframes thinkBounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-10px); opacity: 1; }
}
```

---

## Implementation Order

1. **Phase 0** — Read codebase, find interview page, map all existing state/handlers
2. **Phase 1** — Fonts + color tokens
3. **Phase 2** — Fullscreen dark container + AmbientBackground
4. **Phase 7** — Bottom controls (wire to existing handlers — quick win to verify wiring works)
5. **Phase 3** — Top bar (wire to existing job title, timer, connection status)
6. **Phase 4** — Avatar orb (the visual centerpiece)
7. **Phase 5** — Waveform
8. **Phase 6** — Status text
9. **Phase 8** — State mapping (connect visual modes to existing interview state)
10. **Phase 9** — Final assembly, test all transitions

---

## Testing Checklist

- [ ] Interview page is fullscreen (no navbar, no scroll, covers entire viewport)
- [ ] Background is dark (#06080f) with visible grid pattern and floating orbs
- [ ] Top bar shows job title, attempt number, live/connecting badge, and running timer
- [ ] Timer uses monospace font (JetBrains Mono) with tracking
- [ ] Badge shows amber "Connecting" during setup, red "Live" when active
- [ ] Live badge pulse dot animates
- [ ] Avatar shows connecting spinner during setup
- [ ] Avatar shows AI mark SVG (3 overlapping circles) when AI speaks
- [ ] AI mark center point breathes (animates r and opacity)
- [ ] Avatar rings pulse cyan when AI speaks
- [ ] Avatar shows mic SVG when user speaks
- [ ] Avatar rings pulse green when user speaks
- [ ] Avatar shows purple bouncing dots when AI is thinking
- [ ] Waveform bars are flat and dim when idle
- [ ] Waveform bars animate cyan when AI speaks
- [ ] Waveform bars animate green when user speaks
- [ ] Status label text color matches mode (cyan/green/amber/purple)
- [ ] Status label uses monospace font, uppercase, tracked
- [ ] Mute button toggles visual state (default → muted red)
- [ ] End Interview button triggers existing end handler
- [ ] All existing audio/mic/WebRTC logic works unchanged
- [ ] Body overflow is hidden when page is mounted, restored on unmount
- [ ] No console errors on state transitions
- [ ] Ambient background orb color shifts based on mode (cyan → green → purple)
