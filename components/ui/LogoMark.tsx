interface LogoMarkProps {
  className?: string
}

/**
 * Original emblem for the simulator: a stylized soccer ball over a lime disc,
 * with "26" for the 2026 edition. Not the official FIFA mark.
 */
export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Emblema Mundial 2026"
      className={className}
    >
      {/* Lime disc */}
      <circle cx="32" cy="32" r="31" fill="#c6f24e" />
      <circle cx="32" cy="32" r="31" fill="none" stroke="#0a0a0a" strokeOpacity="0.15" strokeWidth="1" />

      {/* Soccer ball: central pentagon + radiating seams, dark on lime */}
      <g fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* central pentagon */}
        <polygon points="32,20 41,26.5 37.5,37 26.5,37 23,26.5" fill="#0a0a0a" stroke="none" />
        {/* seams from pentagon vertices to the rim */}
        <line x1="32" y1="20" x2="32" y2="9" />
        <line x1="41" y1="26.5" x2="51" y2="22" />
        <line x1="37.5" y1="37" x2="46" y2="46" />
        <line x1="26.5" y1="37" x2="18" y2="46" />
        <line x1="23" y1="26.5" x2="13" y2="22" />
      </g>

      {/* "26" badge tucked bottom-right */}
      <g>
        <circle cx="47" cy="47" r="13" fill="#0a0a0a" />
        <text
          x="47"
          y="47"
          fill="#c6f24e"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-geist-sans), Arial, sans-serif"
        >
          26
        </text>
      </g>
    </svg>
  )
}
