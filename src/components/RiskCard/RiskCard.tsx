import { AlertTriangle, Clock, MapPin, ArrowRight } from 'lucide-react';
import type { Risk } from '@/types';
import { RiskTypeText, RiskLevelText, RiskStatus } from '@/types';
import { riskLevelColors, riskTypeColors } from '@/utils/statusColors';
import { formatDuration, formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface RiskCardProps {
  risk: Risk;
  onLocate: (pileId: string) => void;
  isPinned?: boolean;
}

export default function RiskCard({ risk, onLocate, isPinned }: RiskCardProps) {
  const levelColor = riskLevelColors[risk.level];
  const typeColor = riskTypeColors[risk.type];

  return (
    <div
      className={cn(
        'relative bg-slate-900 border rounded-xl p-5 transition-all duration-300 hover:shadow-xl',
        isPinned
          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
          : 'border-slate-800 hover:border-slate-700'
      )}
    >
      {isPinned && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-xs font-medium rounded-br-xl rounded-tl-xl">
          置顶
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isPinned ? 'bg-red-500/20 animate-pulse-slow' : `${levelColor.bg}/20`
            )}
          >
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                isPinned ? 'text-red-400' : levelColor.text
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  typeColor.bg,
                  typeColor.text
                )}
              >
                {RiskTypeText[risk.type]}
              </span>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  levelColor.bg,
                  'text-white'
                )}
              >
                {RiskLevelText[risk.level]}风险
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{risk.id}</p>
          </div>
        </div>

        <span
          className={cn(
            'text-xs px-2 py-1 rounded',
            risk.status === RiskStatus.RESOLVED
              ? 'bg-emerald-500/20 text-emerald-400'
              : risk.status === RiskStatus.PROCESSING
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-700 text-slate-400'
          )}
        >
          {risk.status === RiskStatus.RESOLVED
            ? '已解决'
            : risk.status === RiskStatus.PROCESSING
            ? '处理中'
            : '待处理'}
        </span>
      </div>

      <p className="text-sm text-slate-200 mb-4">{risk.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <MapPin className="w-3 h-3" />
            关联桩号
          </div>
          <p className="text-sm font-medium text-white">{risk.pileId}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            持续时长
          </div>
          <p className={cn('text-sm font-medium', levelColor.text)}>
            {formatDuration(risk.durationHours)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            发现时间
          </div>
          <p className="text-sm text-slate-300">{formatDateTime(risk.createdAt).split(' ')[0]}</p>
        </div>
      </div>

      <button
        onClick={() => onLocate(risk.pileId)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors group"
      >
        定位到桩位
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
