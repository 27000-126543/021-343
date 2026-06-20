import { useState } from 'react';
import { Flame, Building2, Wrench, AlertTriangle, CheckCircle2, ChevronDown, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const sections = ['A区', 'B区', 'C区', 'D区'];

function getHeatColor(rate: number): string {
  if (rate >= 80) return 'from-emerald-500/30 to-emerald-600/10 border-emerald-500/30';
  if (rate >= 60) return 'from-amber-500/30 to-amber-600/10 border-amber-500/30';
  if (rate >= 40) return 'from-orange-500/30 to-orange-600/10 border-orange-500/30';
  return 'from-red-500/30 to-red-600/10 border-red-500/30';
}

function getRateTextColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-400';
  if (rate >= 60) return 'text-amber-400';
  if (rate >= 40) return 'text-orange-400';
  return 'text-red-400';
}

interface SectionHeatmapProps {
  onBuildingClick?: (building: string, section: string) => void;
  activeBuilding?: string | null;
  activeDrillSection?: string | null;
  onClearDrill?: () => void;
}

export default function SectionHeatmap({
  onBuildingClick,
  activeBuilding,
  activeDrillSection,
  onClearDrill
}: SectionHeatmapProps) {
  const { getSectionHeatmap } = useAppStore();
  const [activeSection, setActiveSection] = useState<string>('A区');

  const heatmapData = getSectionHeatmap(activeSection);
  const isDrilled = activeBuilding && activeDrillSection;

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">区段进度热力图</h2>
          {isDrilled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">
              已下钻: {activeBuilding} · {activeDrillSection}
            </span>
          )}
        </div>
        {isDrilled && onClearDrill && (
          <button
            onClick={onClearDrill}
            className="flex items-center gap-1 px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
            清除下钻
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        {sections.map((sec) => {
          const secData = getSectionHeatmap(sec);
          const avgRate = secData.length > 0
            ? Math.round(secData.reduce((s, d) => s + d.completionRate, 0) / secData.length)
            : 0;
          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={cn(
                'flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all',
                activeSection === sec
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              )}
            >
              <div>{sec}</div>
              <div className={cn('text-xs mt-0.5 font-mono', getRateTextColor(avgRate))} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {avgRate}%
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {heatmapData.map((item) => {
          const isActive = activeBuilding === item.building && activeDrillSection === activeSection;
          return (
            <div
              key={item.building}
              onClick={() => onBuildingClick?.(item.building, activeSection)}
              className={cn(
                'bg-gradient-to-br rounded-xl p-4 border transition-all',
                getHeatColor(item.completionRate),
                onBuildingClick && 'cursor-pointer hover:scale-[1.02] hover:shadow-lg',
                isActive && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 scale-[1.02]'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-300" />
                  <span className="text-sm font-semibold text-white">{item.building}</span>
                </div>
                <span className={cn('text-2xl font-bold font-mono', getRateTextColor(item.completionRate))} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.completionRate}%
                </span>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all',
                    item.completionRate >= 80 ? 'bg-emerald-500' : item.completionRate >= 60 ? 'bg-amber-500' : item.completionRate >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  )}
                  style={{ width: `${Math.min(item.completionRate, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-xs text-slate-400">已完成</div>
                  <div className="text-sm font-bold text-white font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.completed}</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                  <div className="text-xs text-slate-400">施工中</div>
                  <div className="text-sm font-bold text-white font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.inProgress}</div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 mx-auto mb-1" />
                  <div className="text-xs text-slate-400">风险</div>
                  <div className={cn('text-sm font-bold font-mono', item.riskCount > 0 ? 'text-red-400' : 'text-slate-500')} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.riskCount}</div>
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-500 text-center">
                共 {item.total} 根
                {onBuildingClick && (
                  <span className="text-blue-400 ml-1">点击下钻 →</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
