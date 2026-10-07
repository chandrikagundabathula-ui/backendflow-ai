import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon: React.ReactNode;
  accentColor?: 'cyan' | 'indigo' | 'emerald' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtext,
  icon,
  accentColor = 'cyan',
}) => {
  const accentIconBg = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const accentGlow = {
    cyan: 'hover:border-cyan-500/40 hover:shadow-cyan-950/30',
    indigo: 'hover:border-indigo-500/40 hover:shadow-indigo-950/30',
    emerald: 'hover:border-emerald-500/40 hover:shadow-emerald-950/30',
    amber: 'hover:border-amber-500/40 hover:shadow-amber-950/30',
    purple: 'hover:border-purple-500/40 hover:shadow-purple-950/30',
  };

  return (
    <Card
      variant="default"
      className={`p-5 transition-all duration-300 hover:shadow-lg ${accentGlow[accentColor]}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-50 font-mono">
            {value}
          </span>
        </div>
        <div className={`p-2.5 rounded-xl border ${accentIconBg[accentColor]}`}>
          {icon}
        </div>
      </div>

      {(change || subtext) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
                changeType === 'positive'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                  : changeType === 'negative'
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
              {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
              {changeType === 'neutral' && <Minus className="w-3 h-3" />}
              <span>{change}</span>
            </span>
          )}
          {subtext && <span className="text-slate-400 truncate">{subtext}</span>}
        </div>
      )}
    </Card>
  );
};
