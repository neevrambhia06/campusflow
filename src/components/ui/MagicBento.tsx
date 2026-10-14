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
      className={`relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}
    >
      {/* Global Cursor Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl transition-opacity duration-300 z-10"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(650px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
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
  badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200',
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
      className={`relative group bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden ${colSpan} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Local Spotlight Border Glow */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(350px circle at ${cardMousePos.x}px ${cardMousePos.y}px, rgba(99, 102, 241, 0.15), transparent 80%)`,
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Card Header if title/icon present */}
        {(title || icon || badge) && (
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors shrink-0">
                  {icon}
                </div>
              )}
              {title && (
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-base sm:text-lg group-hover:text-indigo-950 transition-colors">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  )}
                </div>
              )}
            </div>

            {badge && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}
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
