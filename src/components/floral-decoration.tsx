import { cn } from '@/lib/utils'

interface FloralDecorationProps {
  className?: string
  variant?: 'branch' | 'corner' | 'small'
}

export function FloralDecoration({
  className,
  variant = 'branch',
}: FloralDecorationProps) {
  if (variant === 'small') {
    return (
      <svg
        viewBox="0 0 60 30"
        aria-hidden="true"
        className={cn('overflow-visible', className)}
      >
        {/* stem */}
        <path
          d="M 5 25 C 15 20, 30 15, 55 8"
          stroke="oklch(0.62 0.10 145)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        {/* leaves */}
        <ellipse
          cx="20"
          cy="19"
          rx="2.5"
          ry="6"
          fill="oklch(0.65 0.10 145)"
          opacity="0.4"
          transform="rotate(-35,20,19)"
        />
        <ellipse
          cx="35"
          cy="13"
          rx="2"
          ry="5"
          fill="oklch(0.65 0.10 145)"
          opacity="0.35"
          transform="rotate(20,35,13)"
        />
        {/* flower 1 */}
        <g transform="translate(15,18)">
          <ellipse cx="0" cy="-5" rx="2.5" ry="4" fill="oklch(0.75 0.09 5)" opacity="0.65" transform="rotate(0)" />
          <ellipse cx="0" cy="-5" rx="2.5" ry="4" fill="oklch(0.75 0.09 5)" opacity="0.65" transform="rotate(72)" />
          <ellipse cx="0" cy="-5" rx="2.5" ry="4" fill="oklch(0.75 0.09 5)" opacity="0.65" transform="rotate(144)" />
          <ellipse cx="0" cy="-5" rx="2.5" ry="4" fill="oklch(0.75 0.09 5)" opacity="0.65" transform="rotate(216)" />
          <ellipse cx="0" cy="-5" rx="2.5" ry="4" fill="oklch(0.75 0.09 5)" opacity="0.65" transform="rotate(288)" />
          <circle r="3" fill="oklch(0.85 0.10 60)" opacity="0.85" />
        </g>
        {/* flower 2 */}
        <g transform="translate(45,10)">
          <ellipse cx="0" cy="-4.5" rx="2" ry="3.5" fill="oklch(0.70 0.09 350)" opacity="0.6" transform="rotate(0)" />
          <ellipse cx="0" cy="-4.5" rx="2" ry="3.5" fill="oklch(0.70 0.09 350)" opacity="0.6" transform="rotate(72)" />
          <ellipse cx="0" cy="-4.5" rx="2" ry="3.5" fill="oklch(0.70 0.09 350)" opacity="0.6" transform="rotate(144)" />
          <ellipse cx="0" cy="-4.5" rx="2" ry="3.5" fill="oklch(0.70 0.09 350)" opacity="0.6" transform="rotate(216)" />
          <ellipse cx="0" cy="-4.5" rx="2" ry="3.5" fill="oklch(0.70 0.09 350)" opacity="0.6" transform="rotate(288)" />
          <circle r="2.5" fill="oklch(0.88 0.09 60)" opacity="0.8" />
        </g>
        {/* tiny dots */}
        <circle cx="28" cy="14" r="1.2" fill="oklch(0.72 0.10 5)" opacity="0.4" />
        <circle cx="8" cy="24" r="1" fill="oklch(0.65 0.10 145)" opacity="0.35" />
      </svg>
    )
  }

  if (variant === 'corner') {
    return (
      <svg
        viewBox="0 0 90 90"
        aria-hidden="true"
        className={cn('overflow-visible', className)}
      >
        {/* Curved stems */}
        <path
          d="M 5 85 C 10 60, 25 40, 50 15"
          stroke="oklch(0.62 0.10 145)"
          strokeWidth="1.2"
          fill="none"
          opacity="0.45"
        />
        <path
          d="M 5 85 C 30 80, 55 70, 85 60"
          stroke="oklch(0.62 0.10 145)"
          strokeWidth="1"
          fill="none"
          opacity="0.35"
        />
        {/* Main flower */}
        <g transform="translate(48,18)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-8"
              rx="4"
              ry="6.5"
              fill="oklch(0.72 0.10 5)"
              opacity="0.6"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="5" fill="oklch(0.84 0.12 58)" opacity="0.8" />
        </g>
        {/* Side flower */}
        <g transform="translate(72,62)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="0"
              cy="-6"
              rx="3"
              ry="5"
              fill="oklch(0.68 0.09 350)"
              opacity="0.55"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="3.5" fill="oklch(0.84 0.10 60)" opacity="0.75" />
        </g>
        {/* Leaves */}
        <ellipse cx="30" cy="52" rx="3" ry="8.5" fill="oklch(0.62 0.10 145)" opacity="0.4" transform="rotate(-40,30,52)" />
        <ellipse cx="18" cy="68" rx="2.5" ry="7" fill="oklch(0.62 0.10 145)" opacity="0.35" transform="rotate(-15,18,68)" />
        <ellipse cx="60" cy="35" rx="2.5" ry="7" fill="oklch(0.62 0.10 145)" opacity="0.38" transform="rotate(20,60,35)" />
        <ellipse cx="62" cy="74" rx="2" ry="6" fill="oklch(0.62 0.10 145)" opacity="0.3" transform="rotate(-25,62,74)" />
        {/* Small bud */}
        <g transform="translate(22,35)">
          <circle cx="0" cy="-4" r="2.5" fill="oklch(0.78 0.09 350)" opacity="0.5" />
          <circle cx="3.8" cy="1.2" r="2.5" fill="oklch(0.78 0.09 350)" opacity="0.5" />
          <circle cx="-3.8" cy="1.2" r="2.5" fill="oklch(0.78 0.09 350)" opacity="0.5" />
          <circle r="3" fill="oklch(0.86 0.09 60)" opacity="0.6" />
        </g>
        {/* Dots */}
        <circle cx="40" cy="38" r="1.5" fill="oklch(0.72 0.10 5)" opacity="0.3" />
        <circle cx="55" cy="55" r="1.2" fill="oklch(0.62 0.10 145)" opacity="0.3" />
        <circle cx="82" cy="78" r="1.5" fill="oklch(0.68 0.09 350)" opacity="0.3" />
      </svg>
    )
  }

  // branch (default) — wide horizontal
  return (
    <svg
      viewBox="0 0 220 70"
      aria-hidden="true"
      className={cn('overflow-visible', className)}
    >
      {/* Main branch */}
      <path
        d="M 8 60 C 30 50, 70 35, 110 28 C 145 22, 180 18, 215 15"
        stroke="oklch(0.62 0.10 145)"
        strokeWidth="1.3"
        fill="none"
        opacity="0.4"
      />
      {/* Side stems */}
      <path d="M 55 42 C 58 30, 62 22, 65 14" stroke="oklch(0.62 0.10 145)" strokeWidth="0.9" fill="none" opacity="0.3" />
      <path d="M 130 26 C 128 18, 130 10, 135 4" stroke="oklch(0.62 0.10 145)" strokeWidth="0.9" fill="none" opacity="0.3" />

      {/* Flower 1 — rose */}
      <g transform="translate(65,12)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-7" rx="4" ry="6" fill="oklch(0.72 0.10 5)" opacity="0.65" transform={`rotate(${angle})`} />
        ))}
        <circle r="4.5" fill="oklch(0.84 0.12 58)" opacity="0.85" />
      </g>

      {/* Flower 2 — mauve */}
      <g transform="translate(135,5)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-6" rx="3.5" ry="5.5" fill="oklch(0.67 0.09 350)" opacity="0.6" transform={`rotate(${angle})`} />
        ))}
        <circle r="3.8" fill="oklch(0.84 0.10 60)" opacity="0.8" />
      </g>

      {/* Flower 3 — peach, small */}
      <g transform="translate(190,17)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-5" rx="3" ry="4.5" fill="oklch(0.78 0.10 35)" opacity="0.55" transform={`rotate(${angle})`} />
        ))}
        <circle r="3" fill="oklch(0.86 0.10 58)" opacity="0.75" />
      </g>

      {/* Leaves */}
      <ellipse cx="38" cy="50" rx="2.5" ry="7.5" fill="oklch(0.62 0.10 145)" opacity="0.4" transform="rotate(-38,38,50)" />
      <ellipse cx="82" cy="34" rx="2.5" ry="7" fill="oklch(0.62 0.10 145)" opacity="0.38" transform="rotate(18,82,34)" />
      <ellipse cx="115" cy="27" rx="2.5" ry="7" fill="oklch(0.62 0.10 145)" opacity="0.4" transform="rotate(-22,115,27)" />
      <ellipse cx="160" cy="20" rx="2" ry="6" fill="oklch(0.62 0.10 145)" opacity="0.35" transform="rotate(15,160,20)" />

      {/* Bud cluster */}
      <g transform="translate(25,56)" opacity="0.5">
        <circle cx="0" cy="-4" r="2.5" fill="oklch(0.78 0.09 350)" />
        <circle cx="3.5" cy="1" r="2" fill="oklch(0.78 0.09 350)" />
        <circle cx="-3.5" cy="1" r="2" fill="oklch(0.78 0.09 350)" />
        <circle r="3" fill="oklch(0.86 0.09 60)" />
      </g>

      {/* Scatter dots */}
      <circle cx="50" cy="44" r="1.5" fill="oklch(0.72 0.10 5)" opacity="0.3" />
      <circle cx="100" cy="30" r="1.2" fill="oklch(0.62 0.10 145)" opacity="0.3" />
      <circle cx="170" cy="18" r="1.2" fill="oklch(0.67 0.09 350)" opacity="0.3" />
      <circle cx="210" cy="16" r="1" fill="oklch(0.72 0.10 5)" opacity="0.25" />
    </svg>
  )
}
