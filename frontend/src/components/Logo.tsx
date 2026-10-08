interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  variant?: 'circle' | 'full';
}

/**
 * OATH CLASSES SVG Logo — faithful recreation based on the provided logo:
 * Cream circular seal, navy shield with 'O', laurel wreath, with wordmark below.
 */
export default function Logo({ size = 64, showText = true, className = '', variant = 'circle' }: LogoProps) {
  const navy = '#0F2449';
  const cream = '#F5EEDB';
  const gold = '#C9A961';

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LogoInner size={size} navy={navy} cream={cream} gold={gold} />
        {showText && (
          <div className="leading-tight">
            <div className="font-display text-2xl md:text-3xl font-black tracking-wide text-white">
              OATH
            </div>
            <div className="font-display text-xl md:text-2xl font-bold tracking-widest text-[#D4AF37] -mt-1">
              CLASSES
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoInner size={size} navy={navy} cream={cream} gold={gold} />
      {showText && (
        <div className="leading-tight">
          <div className="font-display text-xl md:text-2xl font-black tracking-tight text-[#0F2449]">
            OATH <span className="text-[#C9A961]">CLASSES</span>
          </div>
          <div className="text-[10px] md:text-[11px] font-semibold tracking-[0.2em] text-[#2b2f77]/70 uppercase">
            Concept • Marks • Success
          </div>
        </div>
      )}
    </div>
  );
}

function LogoInner({ size, navy, cream, gold }: { size: number; navy: string; cream: string; gold: string }) {
  return (
    <div
      className="relative rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" width={size} height={size} className="drop-shadow-lg">
        <defs>
          <radialGradient id="creamBg" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#FDF8EA" />
            <stop offset="100%" stopColor={cream} />
          </radialGradient>
        </defs>
        {/* Outer cream circle */}
        <circle cx="100" cy="100" r="96" fill="url(#creamBg)" stroke={navy} strokeWidth="3" />
        {/* Inner thin gold ring */}
        <circle cx="100" cy="100" r="86" fill="none" stroke={gold} strokeWidth="1.2" strokeDasharray="2 3" opacity="0.8" />

        {/* Laurel wreath left */}
        <g fill={navy}>
          <path d="M 55 55 Q 40 80 48 110 Q 56 130 75 142" stroke={navy} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Leaves */}
          {[[54, 62], [48, 75], [48, 90], [52, 105], [58, 120], [68, 132]].map(([cx, cy], i) => (
            <ellipse key={'l' + i} cx={cx} cy={cy} rx="7" ry="3.2" transform={`rotate(${-45 + i * 10} ${cx} ${cy})`} fill={navy} />
          ))}
          {/* Right wreath */}
          <path d="M 145 55 Q 160 80 152 110 Q 144 130 125 142" stroke={navy} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {[[146, 62], [152, 75], [152, 90], [148, 105], [142, 120], [132, 132]].map(([cx, cy], i) => (
            <ellipse key={'r' + i} cx={cx} cy={cy} rx="7" ry="3.2" transform={`rotate(${45 - i * 10} ${cx} ${cy})`} fill={navy} />
          ))}
        </g>

        {/* Shield */}
        <g>
          <path
            d="M 100 42 L 130 54 L 130 92 Q 130 122 100 138 Q 70 122 70 92 L 70 54 Z"
            fill={navy}
            stroke={gold}
            strokeWidth="1.5"
          />
          {/* O in shield */}
          <text
            x="100"
            y="108"
            textAnchor="middle"
            fontFamily="Playfair Display, serif"
            fontSize="48"
            fontWeight="900"
            fill={cream}
          >
            O
          </text>
        </g>

        {/* Banner tie at bottom of wreath */}
        <path d="M 78 140 Q 100 150 122 140" stroke={navy} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
