import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'interactive' | 'bordered';
  glow?: 'none' | 'cyan' | 'indigo' | 'emerald';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  glow = 'none',
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-xl transition-all duration-200 overflow-hidden';

  const variantStyles = {
    default: 'bg-slate-900/80 border border-slate-800 shadow-md shadow-black/40',
    glass:
      'bg-slate-900/50 backdrop-blur-xl border border-slate-800/90 shadow-lg shadow-black/50',
    interactive:
      'bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-cyan-950/20 hover:shadow-xl cursor-pointer',
    bordered: 'bg-transparent border border-slate-800',
  };

  const glowStyles = {
    none: '',
    cyan: 'shadow-cyan-500/10 border-cyan-500/30 hover:border-cyan-500/50',
    indigo: 'shadow-indigo-500/10 border-indigo-500/30 hover:border-indigo-500/50',
    emerald: 'shadow-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`px-5 py-4 border-b border-slate-800/80 flex flex-col gap-1 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-base font-semibold text-slate-100 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs text-slate-400 font-normal leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div
    className={`px-5 py-3.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between ${className}`}
    {...props}
  >
    {children}
  </div>
);
