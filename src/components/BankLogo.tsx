import React from 'react';

interface BankLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'mark' | 'white';
  className?: string;
  showSubtitle?: boolean;
}

export const BankLogo: React.FC<BankLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSubtitle = true
}) => {
  const iconSizes = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Emblem Icon */}
      <div
        className={`relative flex shrink-0 items-center justify-center rounded-xl shadow-md ring-1 ring-black/10 overflow-hidden ${iconSizes[size]} ${
          isWhite
            ? 'bg-white text-rose-950 shadow-white/10'
            : 'bg-gradient-to-br from-[#881337] via-[#9F1239] to-[#4C0519] text-white shadow-rose-950/20'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full p-1.5"
        >
          {/* Subtle geometric background grid line */}
          <line
            x1="8"
            y1="40"
            x2="40"
            y2="8"
            stroke={isWhite ? 'rgba(159, 18, 57, 0.15)' : 'rgba(255, 255, 255, 0.15)'}
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          {/* Stylized Interlocking Nova "N" Facets */}
          <path
            d="M12 36V12L24 28V12"
            stroke={isWhite ? '#881337' : '#FFFFFF'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 36V20L36 36V12"
            stroke={isWhite ? '#BE123C' : '#FDA4AF'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gold Security Node */}
          <circle
            cx="36"
            cy="12"
            r="3"
            fill="#FBBF24"
            stroke={isWhite ? '#881337' : '#4C0519'}
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Wordmark & Subtitle */}
      {variant !== 'mark' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span
              className={`font-bold tracking-tight leading-none ${textSizes[size]} ${
                isWhite ? 'text-white' : 'text-slate-900'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Nova<span className={isWhite ? 'text-rose-200' : 'text-rose-900'}>Bank</span>
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-semibold tracking-widest uppercase mt-0.5 leading-none ${subSizes[size]} ${
                isWhite ? 'text-rose-200/80' : 'text-rose-900/80'
              }`}
            >
              Private Banking
            </span>
          )}
        </div>
      )}
    </div>
  );
};
