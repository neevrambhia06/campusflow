import { useState, useRef } from 'react';

interface TechTextProps {
  text: string;
  subtext?: string;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export function TechText({
  text = 'CampusFlow',
  subtext,
  className = '',
  glowColor = '#4f46e5',
  onClick,
}: TechTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isContainerHovered, setIsContainerHovered] = useState(false);

  const letters = Array.from(text);

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
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => {
        setIsContainerHovered(false);
        setHoveredIndex(null);
      }}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none cursor-pointer group ${className}`}
    >
      {/* Tech Grid / Coordinate overlay on hover */}
      <div 
        className={`absolute -inset-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] backdrop-blur-[1px] pointer-events-none transition-all duration-300 ${
          isContainerHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Corner tech reticles */}
        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-indigo-600" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-indigo-600" />
        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-indigo-600" />
        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-indigo-600" />
        
        {/* Subtle coordinate indicator */}
        <div className="absolute top-1 right-2 text-[8px] font-mono text-indigo-500/60 uppercase tracking-widest hidden sm:block">
          X: {Math.round(mousePos.x)} | Y: {Math.round(mousePos.y)}
        </div>
      </div>

      {/* Main Wordmark Letters with Vector Paths under Cursor */}
      <div className="relative flex items-center tracking-tight font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl">
        {letters.map((char, index) => {
          const isHovered = hoveredIndex === index;
          const isNearby =
            hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

          return (
            <span
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              className="relative px-0.5 sm:px-1 transition-all duration-200 transform"
              style={{
                transform: isHovered
                  ? 'translateY(-4px) scale(1.05)'
                  : isNearby
                  ? 'translateY(-2px) scale(1.02)'
                  : 'none',
              }}
            >
              {/* Solid Letter Base */}
              <span
                className={`transition-colors duration-200 ${
                  isHovered
                    ? 'text-indigo-600 drop-shadow-[0_4px_12px_rgba(79,70,229,0.3)]'
                    : 'text-slate-900'
                }`}
              >
                {char}
              </span>

              {/* Dashed Vector Overlay under Cursor */}
              {isHovered && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none animate-pulse"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <rect
                    x="2"
                    y="2"
                    width="96"
                    height="96"
                    fill="none"
                    stroke={glowColor}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="opacity-70"
                  />
                  {/* Vector Crosshair nodes */}
                  <circle cx="2" cy="2" r="3" fill={glowColor} />
                  <circle cx="98" cy="2" r="3" fill={glowColor} />
                  <circle cx="2" cy="98" r="3" fill={glowColor} />
                  <circle cx="98" cy="98" r="3" fill={glowColor} />
                </svg>
              )}

              {/* Digital glitch micro-accent on individual letter */}
              {isHovered && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold text-indigo-500 uppercase tracking-tighter">
                  0{index + 1}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Subtext with cyber pill style */}
      {subtext && (
        <div className="mt-2 sm:mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] sm:text-xs font-mono font-semibold text-slate-600 group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
