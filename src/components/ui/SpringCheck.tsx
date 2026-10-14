import { useState } from 'react';

interface SpringCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function SpringCheck({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}: SpringCheckProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setIsAnimating(true);
    onChange(!checked);
    setTimeout(() => setIsAnimating(false), 400);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-start gap-3 select-none transition-opacity ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {/* Spring Checkbox Box */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${
            checked
              ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20'
              : 'bg-white border-slate-300 hover:border-indigo-400'
          } ${
            isAnimating
              ? 'scale-125 rotate-3'
              : 'scale-100 rotate-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Animated SVG Checkmark */}
          <svg
            className={`w-4 h-4 text-white transition-all duration-300 ${
              checked
                ? 'opacity-100 scale-100 stroke-dashoffset-0'
                : 'opacity-0 scale-50'
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Spring Ripple Effect when checked */}
        {isAnimating && checked && (
          <span className="absolute -inset-2 rounded-xl border-2 border-emerald-400/60 animate-ping pointer-events-none" />
        )}
      </div>

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <p
              className={`text-sm font-semibold transition-colors ${
                checked ? 'text-slate-900 font-bold' : 'text-slate-700'
              }`}
            >
              {label}
            </p>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
