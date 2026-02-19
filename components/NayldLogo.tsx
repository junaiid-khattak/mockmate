import { type SVGProps } from "react";

export function NayldLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 400 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Score ring mark */}
      <circle cx="40" cy="40" r="28" stroke="#f1f5f9" strokeWidth="5" />
      <circle
        cx="40"
        cy="40"
        r="28"
        stroke="url(#nayldLogoGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="175.9"
        strokeDashoffset="44"
        transform="rotate(-90 40 40)"
      />
      {/* Checkmark */}
      <path
        d="M25 42 L34 51 L56 29"
        stroke="#0f172a"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Wordmark */}
      <text
        x="85"
        y="52"
        fontFamily="var(--font-outfit), Outfit, -apple-system, sans-serif"
        fontSize="48"
        fontWeight="800"
        fill="#0f172a"
        letterSpacing="-1.5"
      >
        nayld
      </text>
      <text
        x="205"
        y="52"
        fontFamily="var(--font-outfit), Outfit, -apple-system, sans-serif"
        fontSize="46"
        fontWeight="700"
        fill="#ef4460"
        letterSpacing="-1"
      >
        .ai
      </text>
      <defs>
        <linearGradient id="nayldLogoGrad" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="#ef4460" />
          <stop offset="60%" stopColor="#f97066" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
    </svg>
  );
}
