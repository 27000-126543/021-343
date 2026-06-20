import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
  onClick?: () => void;
}

const colorClasses = {
  blue: 'from-blue-500/20 to-blue-600/10 text-blue-400 border-blue-500/30',
  green: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
  amber: 'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
  red: 'from-red-500/20 to-red-600/10 text-red-400 border-red-500/30',
  violet: 'from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/30'
};

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  onClick
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden bg-gradient-to-br border rounded-xl p-5 transition-all duration-300',
        colorClasses[color],
        onClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg'
      )}
    >
      <div className="absolute top-4 right-4">
        <div className="w-10 h-10 rounded-lg bg-slate-900/50 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {value}
          </span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>

        {trend !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            {trend >= 0 ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-400" />
            )}
            <span className={trend >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {Math.abs(trend)}%
            </span>
            {trendLabel && <span className="text-slate-500">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
