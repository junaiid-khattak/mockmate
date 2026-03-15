interface Props {
  className?: string;
  state?: "ai" | "user" | "followup";
  question?: string;
  variant?: "hero" | "step";
}

// ─── state-specific config ──────────────────────────────────────────────────

const stateConfig = {
  ai: {
    primary: "#8b5cf6",
    ring: "rgba(139,92,246",
    waveform: "#6d28d9",
    label: "AI INTERVIEWER SPEAKING",
    labelColor: "#7c3aed",
    timer: "01:24",
    defaultQuestion:
      "Tell me about a challenging project you led and what you learned from it.",
  },
  user: {
    primary: "#10b981",
    ring: "rgba(16,185,129",
    waveform: "#10b981",
    label: "YOU'RE SPEAKING",
    labelColor: "#10b981",
    timer: "03:47",
    defaultQuestion:
      "Describe a time you led a team through a difficult deadline under pressure.",
  },
  followup: {
    primary: "#f59e0b",
    ring: "rgba(245,158,11",
    waveform: "#f59e0b",
    label: "AI INTERVIEWER — FOLLOW-UP",
    labelColor: "#f59e0b",
    timer: "06:12",
    defaultQuestion:
      "You mentioned reducing response time by 40%. Walk me through the specific decisions that got you there.",
  },
} as const;

// Deterministic "random" bar heights for waveform visual interest
const heroWaveHeights = [
  8, 14, 6, 20, 10, 24, 8, 18, 12, 22, 6, 16, 10, 20, 14, 8, 22, 12, 18, 6,
  24, 10, 14, 8, 20,
];
const stepWaveHeights = [
  6, 16, 10, 22, 8, 18, 12, 20, 6, 14, 10, 24, 8, 16, 12, 20, 6, 18, 10, 14,
];

export function InterviewScreenMockup({
  className = "",
  state = "ai",
  question,
  variant = "step",
}: Props) {
  const cfg = stateConfig[state];
  const isUser = state === "user";
  const isHero = variant === "hero";
  const avatarSize = isHero ? 90 : 64;
  const outerRingGap = isHero ? 18 : 12;
  const middleRingGap = isHero ? 9 : 6;
  const waveHeights = isHero ? heroWaveHeights : stepWaveHeights;

  const displayQuestion = question ?? cfg.defaultQuestion;

  return (
    <div
      className={className}
      style={{
        background:
          "linear-gradient(145deg, #f8f5ff 0%, #eee6ff 35%, #e6deff 65%, #f0eaff 100%)",
        borderRadius: 16,
        padding: isHero ? 24 : 20,
        fontFamily: "'Instrument Sans', -apple-system, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ─── Top bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: isHero ? 24 : 18,
        }}
      >
        {/* Left: job info */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#1a1a2e",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Senior Software Engineer at Deep
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#8b8b9e",
              marginTop: 2,
            }}
          >
            Mock Interview · nayld.ai
          </div>
        </div>

        {/* Right: LIVE badge + timer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
            marginLeft: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: 20,
              padding: "3px 10px",
            }}
          >
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "1px",
                color: "#ef4444",
              }}
            >
              LIVE
            </span>
          </div>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#64648c",
              background: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            {cfg.timer}
          </span>
        </div>
      </div>

      {/* ─── Avatar with concentric rings ────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: isHero ? 18 : 14,
        }}
      >
        <div
          style={{
            position: "relative",
            width: avatarSize + outerRingGap * 2,
            height: avatarSize + outerRingGap * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outer ring */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1px solid ${cfg.ring},0.06)`,
            }}
          />
          {/* Middle ring */}
          <div
            style={{
              position: "absolute",
              inset: outerRingGap - middleRingGap,
              borderRadius: "50%",
              border: `1px solid ${cfg.ring},0.10)`,
            }}
          />
          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              inset: outerRingGap,
              borderRadius: "50%",
              border: `1px solid ${cfg.ring},0.16)`,
            }}
          />
          {/* Avatar circle */}
          <div
            style={{
              position: "relative",
              width: avatarSize - 8,
              height: avatarSize - 8,
              borderRadius: "50%",
              background: "white",
              boxShadow: `0 2px 10px ${cfg.ring},0.1)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isUser ? (
              /* Mic icon for user state */
              <svg
                width={isHero ? 28 : 22}
                height={isHero ? 28 : 22}
                viewBox="0 0 24 24"
                fill="none"
              >
                <rect
                  x="9"
                  y="2"
                  width="6"
                  height="12"
                  rx="3"
                  fill={cfg.primary}
                  opacity="0.9"
                />
                <path
                  d="M5 10a7 7 0 0 0 14 0"
                  stroke={cfg.primary}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.7"
                />
                <line
                  x1="12"
                  y1="19"
                  x2="12"
                  y2="22"
                  stroke={cfg.primary}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            ) : (
              /* AI brain/network icon */
              <svg
                width={isHero ? 30 : 24}
                height={isHero ? 30 : 24}
                viewBox="0 0 32 32"
                fill="none"
              >
                <circle cx="16" cy="10" r="3.5" fill={cfg.primary} opacity="0.8" />
                <circle cx="10" cy="20" r="3" fill={cfg.primary} opacity="0.6" />
                <circle cx="22" cy="20" r="3" fill={cfg.primary} opacity="0.6" />
                <line
                  x1="16"
                  y1="13.5"
                  x2="11"
                  y2="17.5"
                  stroke={cfg.primary}
                  strokeWidth="1.2"
                  opacity="0.4"
                />
                <line
                  x1="16"
                  y1="13.5"
                  x2="21"
                  y2="17.5"
                  stroke={cfg.primary}
                  strokeWidth="1.2"
                  opacity="0.4"
                />
                <line
                  x1="13"
                  y1="20"
                  x2="19"
                  y2="20"
                  stroke={cfg.primary}
                  strokeWidth="1.2"
                  opacity="0.3"
                />
                <circle cx="16" cy="16" r="2" fill={cfg.primary} opacity="0.35" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ─── Waveform ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          height: 24,
          marginBottom: 10,
        }}
      >
        {waveHeights.map((h, i) => (
          <div
            key={i}
            style={{
              width: 2.5,
              height: Math.min(h, 24),
              borderRadius: 2,
              background: cfg.waveform,
              opacity: 0.4 + ((i % 3) * 0.15),
            }}
          />
        ))}
      </div>

      {/* ─── State label ─────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: cfg.labelColor,
          marginBottom: 14,
        }}
      >
        {cfg.label}
      </div>

      {/* ─── Message text ────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center" }}>
        {isUser && (
          <p
            style={{
              fontSize: 13,
              color: "#64648c",
              lineHeight: 1.5,
              margin: "0 auto 8px",
              maxWidth: 380,
            }}
          >
            Take your time — the AI is listening...
          </p>
        )}
        <p
          style={{
            fontSize: isHero ? 14 : 13,
            color: isUser ? "#64648c" : "#1a1a2e",
            lineHeight: 1.5,
            margin: "0 auto",
            maxWidth: 380,
            fontStyle: "italic",
          }}
        >
          &ldquo;{displayQuestion}&rdquo;
        </p>
      </div>

      {/* ─── Bottom controls (hero only) ─────────────────────────────────── */}
      {isHero && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 20,
          }}
        >
          <div
            style={{
              border: "1px solid #e0e0e0",
              background: "white",
              color: "#333",
              borderRadius: 10,
              padding: "7px 18px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "default",
            }}
          >
            Mute
          </div>
          <div
            style={{
              border: "1px solid rgba(239,68,68,0.2)",
              background: "rgba(239,68,68,0.05)",
              color: "#ef4444",
              borderRadius: 10,
              padding: "7px 18px",
              fontSize: 12,
              fontWeight: 500,
              cursor: "default",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ fontSize: 10 }}>&#x2715;</span>
            End Interview
          </div>
        </div>
      )}
    </div>
  );
}
