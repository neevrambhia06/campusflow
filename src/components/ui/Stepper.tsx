import { Check } from 'lucide-react';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isCurrent?: boolean;
}

interface StepperProps {
  steps: StepItem[];
  onStepClick?: (stepIndex: number, step: StepItem) => void;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({
  steps,
  onStepClick,
  orientation = 'horizontal',
  className = '',
}: StepperProps) {
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Progress indicator */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
          <span>Overall Workflow Progress</span>
          <span className="text-indigo-600">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => onStepClick?.(idx, step)}
              className={`relative flex items-start gap-4 transition-all duration-200 ${
                onStepClick ? 'cursor-pointer group' : ''
              }`}
            >
              {/* Step Circle */}
              <div
                className={`absolute -left-6 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs ${
                  step.isCompleted
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                    : step.isCurrent
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 scale-110'
                    : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-indigo-400'
                }`}
              >
                {step.isCompleted ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              {/* Step Text */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold transition-colors ${
                      step.isCompleted
                        ? 'text-slate-900'
                        : step.isCurrent
                        ? 'text-indigo-600 font-bold'
                        : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.isCompleted && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700">
                      Done
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal Stepper
  return (
    <div className={`w-full ${className}`}>
      {/* Top Progress bar and stats */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          Experiment Workflow Steps ({completedCount}/{steps.length} Complete)
        </span>
        <span className="font-mono text-indigo-600 font-bold">{progressPercent}%</span>
      </div>

      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Horizontal Steps Bar */}
      <div className="flex items-center justify-between relative overflow-x-auto no-scrollbar pb-2 pt-1">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-initial"
            >
              {/* Step Item */}
              <div
                onClick={() => onStepClick?.(idx, step)}
                className={`flex flex-col items-center text-center px-1 shrink-0 ${
                  onStepClick ? 'cursor-pointer group' : ''
                }`}
              >
                {/* Circle */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs ${
                    step.isCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                      : step.isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 scale-110'
                      : 'bg-white border-2 border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600'
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-semibold max-w-[85px] truncate transition-colors ${
                    step.isCompleted
                      ? 'text-slate-800'
                      : step.isCurrent
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                  title={step.title}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting line between steps */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-1 sm:mx-2 bg-slate-200 relative overflow-hidden min-w-[20px] sm:min-w-[40px]">
                  <div
                    className={`h-full bg-emerald-500 transition-all duration-300 ${
                      step.isCompleted ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
