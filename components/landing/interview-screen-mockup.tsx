interface Props {
  className?: string;
  state?: "ai" | "user" | "followup";
  question?: string;
}

export function InterviewScreenMockup({
  className = "",
  state = "ai",
  question,
}: Props) {
  const isUser = state === "user";
  const ringColor = isUser ? "#34d399" : "#22d3ee";
  const ringGlow = isUser
    ? "0 0 28px rgba(52,211,153,0.5)"
    : "0 0 28px rgba(34,211,238,0.5)";

  const defaultQuestion =
    state === "followup"
      ? "You mentioned reducing response time by 40%. Walk me through the specific decisions that got you there."
      : state === "user"
      ? "Describe a time you led a team through a difficult deadline under pressure."
      : "Tell me about a challenging project you led and what you learned from it.";

  const displayQuestion = question ?? defaultQuestion;

  const statusLabel = isUser
    ? "Take your time — the AI is listening..."
    : state === "followup"
    ? "AI Interviewer — Follow-up question"
    : "AI Interviewer Speaking";

  const waveHeights = isUser
    ? [10, 18, 14, 22, 16, 12, 20, 14, 18, 10]
    : [8, 16, 24, 18, 28, 20, 14, 22, 16, 10];

  return (
    <div
      className={className}
      style={{
        background: "#0e1424",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 20,
        fontFamily: "'Instrument Sans', -apple-system, sans-serif",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#f87171",
              boxShadow: "0 0 6px rgba(248,113,113,0.6)",
            }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#f87171",
            }}
          >
            LIVE
          </span>
        </div>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          01:24
        </span>
      </div>

      {/* Avatar with ring */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ position: "relative", width: 72, height: 72 }}>
          {/* Outer glow ring */}
          <div
            style={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: `2px solid ${ringColor}`,
              boxShadow: ringGlow,
              opacity: 0.7,
            }}
          />
          {/* Inner ring */}
          <div
            style={{
              position: "absolute",
              inset: -2,
              borderRadius: "50%",
              border: `1.5px solid ${ringColor}`,
              opacity: 0.4,
            }}
          />
          {/* Avatar circle */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${ringColor}22, ${ringColor}08)`,
              border: `1.5px solid ${ringColor}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isUser ? (
              /* Mic icon for user state */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill={ringColor} opacity="0.9" />
                <path
                  d="M5 10a7 7 0 0 0 14 0"
                  stroke={ringColor}
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
                  stroke={ringColor}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
              </svg>
            ) : (
              /* AI avatar waves */
              <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <rect
                    key={i}
                    x={i * 6}
                    y={[6, 2, 0, 4, 6][i]}
                    width="3"
                    height={[8, 16, 20, 12, 8][i]}
                    rx="1.5"
                    fill={ringColor}
                    opacity={0.6 + i * 0.08}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          height: 32,
          marginBottom: 12,
        }}
      >
        {waveHeights.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              background: ringColor,
              opacity: isUser ? 0.5 + (i % 3) * 0.15 : 0.3 + (i % 4) * 0.15,
            }}
          />
        ))}
      </div>

      {/* Status label */}
      <div
        style={{
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: ringColor,
          marginBottom: 14,
          opacity: 0.8,
        }}
      >
        {statusLabel}
      </div>

      {/* Question text */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          &ldquo;{displayQuestion}&rdquo;
        </p>
      </div>
    </div>
  );
}
