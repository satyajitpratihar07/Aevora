import React from "react";

interface AvoraLogoProps {
  size?: number;
  showName?: boolean;
  nameSize?: number;
  className?: string;
}

export const AvoraLogo: React.FC<AvoraLogoProps> = ({
  size = 36,
  showName = true,
  nameSize = 20,
  className = "",
}) => (
  <div className={className} style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="avora-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0E1B33" />
          <stop offset="50%" stopColor="#081021" />
          <stop offset="100%" stopColor="#040811" />
        </linearGradient>
        <linearGradient id="avora-lp" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#00D2C4" />
          <stop offset="100%" stopColor="#00A3FF" />
        </linearGradient>
        <linearGradient id="avora-rp" x1="100%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#00D2C4" />
          <stop offset="100%" stopColor="#00A3FF" />
        </linearGradient>
        <linearGradient id="avora-cg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C5F6F3" />
        </linearGradient>
        <filter id="avora-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="512" height="512" rx="114" fill="url(#avora-bg)" stroke="#1F3358" strokeWidth="3" />
      <circle cx="256" cy="256" r="140" fill="#00D2C4" opacity="0.12" />
      <g filter="url(#avora-glow)">
        <path
          d="M 120 380 C 150 380, 190 320, 236 170 C 244 142, 252 130, 256 130 C 260 130, 268 142, 276 170"
          fill="none" stroke="url(#avora-lp)" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M 392 380 C 362 380, 322 320, 276 170 C 268 142, 260 130, 256 130"
          fill="none" stroke="url(#avora-rp)" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M 172 310 Q 210 310, 230 290 T 282 290 Q 302 310, 340 310"
          fill="none" stroke="url(#avora-lp)" strokeWidth="20" strokeLinecap="round"
        />
        <g transform="translate(256, 260)">
          <rect x="-30" y="-10" width="60" height="20" rx="6" fill="url(#avora-cg)" />
          <rect x="-10" y="-30" width="20" height="60" rx="6" fill="url(#avora-cg)" />
        </g>
        <circle cx="256" cy="130" r="12" fill="#00E5FF" />
        <circle cx="120" cy="380" r="10" fill="#00D2C4" />
        <circle cx="392" cy="380" r="10" fill="#10B981" />
      </g>
    </svg>
    {showName && (
      <span
        style={{
          fontWeight: 900,
          fontSize: nameSize,
          letterSpacing: "-0.5px",
          background: "linear-gradient(135deg, #00D2C4, #00A3FF)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1,
        }}
      >
        AVORA
      </span>
    )}
  </div>
);
