import * as React from "react"
import { cn } from "@/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'secondary' | 'indigo' | 'purple';
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    outline: "text-slate-800 border border-slate-200",
    secondary: "bg-slate-200 text-slate-800",
    indigo: "bg-indigo-100 text-indigo-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
