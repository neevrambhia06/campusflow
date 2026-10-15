import React, { useRef, useState } from 'react';

interface MagicBentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MagicBentoGrid({ children, className = '' }: MagicBentoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      className={`relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {/* Global Cursor Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.06), transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
}

interface MagicBentoCardProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  badgeColor?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  colSpan?: string;
  onClick?: () => void;
}

export function MagicBentoCard({
  children,
  className = '',
  badge,
  badgeColor = 'bg-indigo-50/90 text-indigo-700 border-indigo-200/70',
  title,
  description,
  icon,
  colSpan = '',
  onClick,
}: MagicBentoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardMousePos, setCardMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCardMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setCardMousePos({ x: -1000, y: -1000 });
      }}
      onClick={onClick}
      className={`relative group bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] hover:border-indigo-300/60 transition-all duration-300 overflow-hidden ${colSpan} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Subtle Top Glow Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

      {/* Local Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(350px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(99, 102, 241, 0.12), transparent 80%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Card Header if title/icon present */}
        {(title || icon || badge) && (
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3.5">
              {icon && (
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-200/80 transition-all duration-300 shadow-2xs shrink-0">
                  {icon}
                </div>
              )}
              {title && (
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-indigo-950 transition-colors">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-normal">{description}</p>
                  )}
                </div>
              )}
            </div>

            {badge && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-2xs shrink-0 ${badgeColor}`}
              >
                {badge}
              </span>
            )}
          </div>
        )}

        {/* Card Body */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
