import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'neutral'
    | 'cyan'
    | 'purple'
    | 'outline'
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH';
  size?: 'sm' | 'md';
  pulse?: boolean;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  pulse = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 font-medium rounded-md tracking-wide transition-colors border select-none';

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
    error: 'bg-rose-950/60 text-rose-400 border-rose-800/60',
    info: 'bg-sky-950/60 text-sky-400 border-sky-800/60',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
    purple: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/80',
    outline: 'bg-transparent text-slate-400 border-slate-700',

    // HTTP Methods
    GET: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 font-mono font-bold',
    POST: 'bg-blue-950/80 text-blue-400 border-blue-500/40 font-mono font-bold',
    PUT: 'bg-amber-950/80 text-amber-400 border-amber-500/40 font-mono font-bold',
    DELETE: 'bg-rose-950/80 text-rose-400 border-rose-500/40 font-mono font-bold',
    PATCH: 'bg-purple-950/80 text-purple-400 border-purple-500/40 font-mono font-bold',
  };

  const dotColors: Record<string, string> = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-rose-400',
    info: 'bg-sky-400',
    cyan: 'bg-cyan-400',
    purple: 'bg-purple-400',
    neutral: 'bg-slate-400',
    outline: 'bg-slate-400',
    GET: 'bg-emerald-400',
    POST: 'bg-blue-400',
    PUT: 'bg-amber-400',
    DELETE: 'bg-rose-400',
    PATCH: 'bg-purple-400',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              dotColors[variant] || 'bg-slate-400'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              dotColors[variant] || 'bg-slate-400'
            }`}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};
