import { useState, useEffect } from 'react';
import { RefreshCw, KeyRound, Sparkles } from 'lucide-react';

interface CodeSlotsProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  className?: string;
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function CodeSlots({
  initialCode = 'CAMPUS',
  onCodeChange,
  className = '',
}: CodeSlotsProps) {
  const [slots, setSlots] = useState<string[]>(initialCode.split(''));
  const [isSpinning, setIsSpinning] = useState(false);

  const spinSlots = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    let iteration = 0;
    const maxIterations = 18;

    const interval = setInterval(() => {
      iteration++;

      setSlots((prev) =>
        prev.map((origChar, index) => {
          // Progressively lock in final characters from left to right
          if (iteration > index * 3 + 6) {
            return initialCode[index] || origChar;
          }
          return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        })
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setSlots(initialCode.split(''));
        setIsSpinning(false);
        if (onCodeChange) onCodeChange(initialCode);
      }
    }, 45);
  };

  useEffect(() => {
    // Initial entrance roll
    spinSlots();
  }, []);

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Code Slot Reels */}
      <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-indigo-950/20">
        <div className="pl-1 pr-1.5 text-indigo-400">
          <KeyRound className="h-4 w-4" />
        </div>

        {slots.map((char, idx) => (
          <div
            key={idx}
            className="relative w-8 h-11 sm:w-10 sm:h-13 bg-slate-800/90 rounded-xl border border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner group"
          >
            {/* Slot glass reflection */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

            {/* Character */}
            <span
              className={`font-mono font-black text-lg sm:text-xl text-white transition-all duration-100 ${
                isSpinning ? 'blur-[0.5px] scale-110 text-indigo-300' : 'text-white'
              }`}
            >
              {char}
            </span>

            {/* Reel border accents */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500/50" />
          </div>
        ))}

        {/* Spin / Reroll Button */}
        <button
          type="button"
          onClick={spinSlots}
          disabled={isSpinning}
          className="ml-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          title="Roll credentials"
        >
          <RefreshCw
            className={`h-4 w-4 text-indigo-400 ${isSpinning ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
        <Sparkles className="h-3 w-3 text-indigo-500" />
        <span>Academic Verification Passcode</span>
      </div>
    </div>
  );
}
