import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";

type Props = { params: { token: string } };

// ─── helpers ────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 8) return "#34d399";
  if (s >= 6) return "#22d3ee";
  if (s >= 4) return "#fbbf24";
  return "#f87171";
}

function scoreRingOffset(score: number) {
  // circumference ≈ 2π×88 ≈ 553
  return Math.round(553 * (1 - score / 10));
}

function gradeLabel(s: number) {
  if (s >= 8.5) return "Excellent Performance";
  if (s >= 7.5) return "Strong Performance";
  if (s >= 6.5) return "Good Progress";
  if (s >= 5.0) return "Solid Foundation";
  return "Needs More Practice";
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServiceRoleSupabaseClient();
  const { data } = await supabase
    .from("interview_sessions")
    .select("performance_overall_score, job_id")
    .eq("share_token", params.token)
    .eq("is_shared", true)
    .maybeSingle();

  if (!data) return { title: "Interview Performance | nayld.ai" };

  const score = data.performance_overall_score
    ? (data.performance_overall_score / 10).toFixed(1)
    : null;

  return {
    title: score
      ? `Interview Performance ${score}/10 | nayld.ai`
      : "Interview Performance | nayld.ai",
    description: "Check out this AI mock interview performance, powered by nayld.ai.",
    robots: { index: false, follow: false },
  };
}

// ─── page ────────────────────────────────────────────────────────────────────

export default async function SharePage({ params }: Props) {
  const supabase = createServiceRoleSupabaseClient();

  // Fetch shared interview
  const { data: interview } = await supabase
    .from("interview_sessions")
    .select(`
      id,
      user_id,
      attempt_number,
      duration_seconds,
      created_at,
      job_id,
      performance_overall_score,
      question_understanding_score,
      answer_correctness_score,
      reasoning_quality_score,
      followup_depth_score,
      communication_clarity_score,
      behavioral_story_quality_score,
      role_alignment_coverage_score,
      confidence_calibration_score,
      time_management_score,
      recovery_ability_score,
      performance_strengths,
      performance_growth_areas,
      performance_next_steps,
      summary
    `)
    .eq("share_token", params.token)
    .eq("is_shared", true)
    .maybeSingle();

  if (!interview) notFound();

  // Fetch candidate name from auth
  const { data: { user: candidateUser } } = await supabase.auth.admin.getUserById(interview.user_id);
  const candidateName =
    candidateUser?.user_metadata?.full_name ??
    candidateUser?.user_metadata?.name ??
    null;

  // Fetch job details
  const { data: job } = interview.job_id
    ? await supabase
        .from("jobs")
        .select("title, company")
        .eq("id", interview.job_id)
        .maybeSingle()
    : { data: null };

  const overallScore = interview.performance_overall_score
    ? interview.performance_overall_score / 10
    : 0;

  const accentColor = scoreColor(overallScore);
  const ringOffset = scoreRingOffset(overallScore);

  const categories = [
    { label: "Question Understanding", score: (interview.question_understanding_score ?? 0) / 10 },
    { label: "Answer Quality", score: (interview.answer_correctness_score ?? 0) / 10 },
    { label: "Reasoning & Problem Solving", score: (interview.reasoning_quality_score ?? 0) / 10 },
    { label: "Communication Clarity", score: (interview.communication_clarity_score ?? 0) / 10 },
    { label: "Confidence & Delivery", score: (interview.confidence_calibration_score ?? 0) / 10 },
  ];

  const strongest = [...categories].sort((a, b) => b.score - a.score)[0];
  const weakest = [...categories].sort((a, b) => a.score - b.score)[0];

  const strengths = interview.performance_strengths ?? [];
  const growthAreas = interview.performance_growth_areas ?? [];
  const nextSteps = interview.performance_next_steps ?? [];

  return (
    <div
      style={{
        fontFamily: "'Instrument Sans', -apple-system, sans-serif",
        background: "#06080f",
        color: "#e8eaf0",
        minHeight: "100vh",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Ambient background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            top: -200,
            left: -100,
            borderRadius: "50%",
            background: `${accentColor}10`,
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            bottom: -150,
            right: -100,
            borderRadius: "50%",
            background: "rgba(167,139,250,0.04)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 60% 40% at 50% 30%, black 10%, transparent 100%)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "40px 24px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <Link
            href="/"
            style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", textDecoration: "none" }}
          >
            nayld<span style={{ color: "#22d3ee" }}>.ai</span>
          </Link>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "5px 14px",
              borderRadius: 100,
            }}
          >
            Interview Performance
          </div>
        </div>

        {/* Hero Score Card */}
        <div
          style={{
            background: "rgba(14,20,36,0.7)",
            backdropFilter: "blur(24px)",
            border: `1px solid ${accentColor}26`,
            borderRadius: 20,
            padding: 40,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {/* Top gradient line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${accentColor}4d, transparent)`,
            }}
          />

          {/* Job Info */}
          <div style={{ marginBottom: 32 }}>
            {candidateName && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  color: accentColor,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                }}
              >
                {candidateName}
              </div>
            )}
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "#e8eaf0",
                letterSpacing: "-0.5px",
                marginBottom: 6,
              }}
            >
              {job?.title ?? "Mock Interview"}
            </h1>
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {job?.company && (
                <>
                  <span>{job.company}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "inline-block" }} />
                </>
              )}
              <span>{formatDate(interview.created_at)}</span>
            </div>
          </div>

          {/* Score Ring */}
          <div
            style={{
              position: "relative",
              width: 200,
              height: 200,
              margin: "0 auto 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="6"
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={accentColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="553"
                strokeDashoffset={ringOffset}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 20,
                borderRadius: "50%",
                background: `${accentColor}4d`,
                filter: "blur(30px)",
                opacity: 0.3,
              }}
            />
            <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  letterSpacing: "-3px",
                  lineHeight: 1,
                  color: accentColor,
                }}
              >
                {overallScore.toFixed(1)}
                <span style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginLeft: 2 }}>
                  /10
                </span>
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginTop: 6,
                  color: accentColor,
                }}
              >
                Overall Score
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 16px",
                  borderRadius: 100,
                  fontSize: 14,
                  fontWeight: 600,
                  marginTop: 4,
                  background: `${accentColor}1a`,
                  color: accentColor,
                  border: `1px solid ${accentColor}33`,
                }}
              >
                {gradeLabel(overallScore)}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 32,
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              flexWrap: "wrap",
            }}
          >
            {[
              { val: formatDuration(interview.duration_seconds), lbl: "Duration" },
              { val: `Attempt #${interview.attempt_number}`, lbl: "Session" },
            ].map(({ val, lbl }) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#e8eaf0", letterSpacing: "-0.5px" }}>
                  {val}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score Breakdown */}
        <SectionCard>
          <SectionHeader>Score Breakdown</SectionHeader>
          {categories.map(({ label, score }) => {
            const c = scoreColor(score);
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 0",
                  borderTop: "1px solid rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#e8eaf0" }}>
                  {label}
                </div>
                <div
                  style={{
                    width: 160,
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(score / 10) * 100}%`,
                      borderRadius: 3,
                      background: c,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    width: 36,
                    textAlign: "right",
                    color: c,
                    flexShrink: 0,
                  }}
                >
                  {score.toFixed(1)}
                </div>
              </div>
            );
          })}
        </SectionCard>

        {/* Highlights */}
        <SectionCard>
          <SectionHeader>Highlights</SectionHeader>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {[
              {
                icon: "💡",
                label: "Strongest Area",
                value: strongest.label + ` (${strongest.score.toFixed(1)}/10)`,
              },
              {
                icon: "🎯",
                label: "Focus Area",
                value: weakest.label + ` (${weakest.score.toFixed(1)}/10)`,
              },
              ...(strengths[0]
                ? [{ icon: "✦", label: "Key Strength", value: strengths[0] }]
                : []),
              ...(growthAreas[0]
                ? [{ icon: "🧩", label: "Room to Grow", value: growthAreas[0] }]
                : []),
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0", lineHeight: 1.4 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Performance Breakdown — collapsible */}
        <details
          style={{
            background: "rgba(14,20,36,0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            marginBottom: 16,
            overflow: "hidden",
          }}
        >
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 28px",
              cursor: "pointer",
              listStyle: "none",
              userSelect: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                📊
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0" }}>Performance Breakdown</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>10 metrics · tap to expand</div>
              </div>
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                flexShrink: 0,
                color: "rgba(255,255,255,0.3)",
                fontSize: 14,
              }}
            >
              ▾
            </div>
          </summary>
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              padding: "20px 28px 28px",
            }}
          >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Question Understanding", score: (interview.question_understanding_score ?? 0) / 10 },
              { label: "Answer Correctness", score: (interview.answer_correctness_score ?? 0) / 10 },
              { label: "Reasoning Quality", score: (interview.reasoning_quality_score ?? 0) / 10 },
              { label: "Depth Under Follow-ups", score: (interview.followup_depth_score ?? 0) / 10 },
              { label: "Communication Clarity", score: (interview.communication_clarity_score ?? 0) / 10 },
              { label: "Behavioral Story Quality", score: (interview.behavioral_story_quality_score ?? 0) / 10 },
              { label: "Role Alignment Coverage", score: (interview.role_alignment_coverage_score ?? 0) / 10 },
              { label: "Confidence Calibration", score: (interview.confidence_calibration_score ?? 0) / 10 },
              { label: "Time Management", score: (interview.time_management_score ?? 0) / 10 },
              { label: "Recovery Ability", score: (interview.recovery_ability_score ?? 0) / 10 },
            ].map(({ label, score }) => {
              const c = scoreColor(score);
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 15,
                      fontWeight: 700,
                      color: c,
                      flexShrink: 0,
                    }}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>

          {strengths.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#34d399",
                  marginBottom: 10,
                }}
              >
                Strengths
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {strengths.map((s: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, display: "flex", gap: 8 }}>
                    <span style={{ color: "#34d399", flexShrink: 0 }}>✦</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {growthAreas.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#fbbf24",
                  marginBottom: 10,
                }}
              >
                Growth Areas
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {growthAreas.map((g: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, display: "flex", gap: 8 }}>
                    <span style={{ color: "#fbbf24", flexShrink: 0 }}>⏳</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nextSteps.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "#22d3ee",
                  marginBottom: 10,
                }}
              >
                Next Steps
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {nextSteps.map((n: string, i: number) => (
                  <li key={i} style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, display: "flex", gap: 8 }}>
                    <span style={{ color: "#22d3ee", flexShrink: 0 }}>→</span>
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </details>

        {/* CTA */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.06), rgba(167,139,250,0.04))",
            border: "1px solid rgba(34,211,238,0.15)",
            borderRadius: 16,
            padding: 32,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#e8eaf0",
              letterSpacing: "-0.5px",
              marginBottom: 8,
            }}
          >
            Nail your next interview
          </h3>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.5)",
              maxWidth: 400,
              margin: "0 auto 20px",
              lineHeight: 1.5,
            }}
          >
            nayld.ai analyzes the job, scores your resume fit, and runs AI mock interviews
            that actually push you.
          </p>
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 12,
              background: "#22d3ee",
              color: "#06080f",
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "-0.2px",
              boxShadow: "0 4px 24px rgba(34,211,238,0.3)",
            }}
          >
            Try It Free →
          </Link>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>
            No credit card required · Get your fit score in 60 seconds
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            marginTop: 8,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <span>
            Powered by{" "}
            <Link href="/" style={{ color: "#22d3ee", textDecoration: "none" }}>
              nayld.ai
            </Link>
          </span>
          <span>Results from AI mock interview</span>
        </div>
      </div>
    </div>
  );
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(14,20,36,0.7)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 28,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "2px",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {children}
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

