"use client";

import { useState } from "react";
import { Share2, Link2, Check, Globe, EyeOff } from "lucide-react";

interface Props {
  interviewId: string;
  initialIsShared: boolean;
  initialShareToken: string | null;
}

export function ShareInterviewButton({
  interviewId,
  initialIsShared,
  initialShareToken,
}: Props) {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : "https://nayld.ai"}/share/${shareToken}`
    : null;

  async function toggleShare() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/share`, { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Failed");
      setIsShared(json.is_shared);
      setShareToken(json.share_token);
      if (json.is_shared) setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Main share button */}
      <button
        onClick={() => {
          if (isShared && shareToken) {
            setOpen((v) => !v);
          } else {
            toggleShare();
          }
        }}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          borderRadius: 8,
          border: isShared
            ? "1px solid rgba(124,92,252,0.3)"
            : "1px solid #e8e8ef",
          background: isShared ? "rgba(124,92,252,0.06)" : "white",
          color: isShared ? "#7c5cfc" : "#6b6b80",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading ? "default" : "pointer",
          transition: "all 0.15s",
          fontFamily: "inherit",
        }}
      >
        <Share2 size={14} />
        {loading ? "…" : isShared ? "Shared" : "Share"}
      </button>

      {/* Dropdown panel */}
      {open && isShared && shareToken && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              zIndex: 50,
              width: 340,
              background: "white",
              border: "1px solid #e8e8ef",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* Status row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Globe size={14} style={{ color: "#7c5cfc" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111118" }}>
                  Public link active
                </span>
              </div>
              <button
                onClick={toggleShare}
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: "1px solid rgba(220,38,38,0.2)",
                  background: "rgba(220,38,38,0.05)",
                  color: "#dc2626",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <EyeOff size={11} />
                {loading ? "…" : "Disable"}
              </button>
            </div>

            {/* Link copy row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f8f8fb",
                border: "1px solid #e8e8ef",
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <Link2 size={14} style={{ color: "#9d9db0", flexShrink: 0 }} />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "#6b6b80",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: "monospace",
                }}
              >
                {shareUrl}
              </span>
              <button
                onClick={copyLink}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: copied ? "rgba(22,163,74,0.1)" : "rgba(124,92,252,0.1)",
                  color: copied ? "#16a34a" : "#7c5cfc",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {copied ? <Check size={12} /> : <Link2 size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <p
              style={{
                fontSize: 11,
                color: "#9d9db0",
                marginTop: 12,
                lineHeight: 1.5,
              }}
            >
              Anyone with this link can view your interview performance. Disable sharing to
              make it private again.
            </p>

            {error && (
              <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>{error}</p>
            )}
          </div>
        </>
      )}

      {error && !open && (
        <p
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            fontSize: 12,
            color: "#dc2626",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
