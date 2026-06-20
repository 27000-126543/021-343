import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Drill, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import FilterBar from '@/components/FilterBar/FilterBar';
import PileGrid from '@/components/PileGrid/PileGrid';
import PileDetailModal from '@/components/PileDetail/PileDetailModal';
import SectionHeatmap from '@/components/SectionHeatmap/SectionHeatmap';
import StatCard from '@/components/StatCard/StatCard';
import { useAppStore } from '@/store/useAppStore';
import { PileStatus, PileStatusText, RiskStatus } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { piles, risks, getDailyStats, selectedDate, highlightedPileId, setHighlightedPileId, setFilters } = useAppStore();
  const [drillBuilding, setDrillBuilding] = useState<string | null>(null);
  const [drillSection, setDrillSection] = useState<string | null>(null);

  useEffect(() => {
    if (highlightedPileId) {
      const timer = setTimeout(() => setHighlightedPileId(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [highlightedPileId, setHighlightedPileId]);

  const handleBuildingClick = (building: string, section: string) => {
    setDrillBuilding(building);
    setDrillSection(section);
    setFilters({ building, section, status: 'all', axis: '', rigId: 'all' });
  };

  const handleClearDrill = () => {
    setDrillBuilding(null);
    setDrillSection(null);
    setFilters({ building: 'all', section: 'all', status: 'all', axis: '', rigId: 'all' });
  };

  const stats = useMemo(() => {
    const statusCounts: Record<PileStatus, number> = {
      [PileStatus.NOT_STARTED]: 0,
      [PileStatus.DRILLING]: 0,
      [PileStatus.PENDING_POUR]: 0,
      [PileStatus.COMPLETED]: 0,
      [PileStatus.PENDING_TEST]: 0
    };

    piles.forEach((pile) => {
      statusCounts[pile.status]++;
    });

    const dailyStats = getDailyStats(selectedDate);
    const completionRate = piles.length > 0
      ? Math.round((statusCounts[PileStatus.COMPLETED] / piles.length) * 100)
      : 0;

    const pendingRisks = risks.filter((r) => r.status !== RiskStatus.RESOLVED);

    return {
      statusCounts,
      total: piles.length,
      completionRate,
      highRisks: pendingRisks.filter((r) => r.level === 'high').length,
      pendingRisks: pendingRisks.length,
      dailyStats
    };
  }, [piles, risks, getDailyStats, selectedDate]);

  const statusColorMap: Record<PileStatus, { bg: string; text: string; dot: string }> = {
    [PileStatus.NOT_STARTED]: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
    [PileStatus.DRILLING]: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
    [PileStatus.PENDING_POUR]: { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500' },
    [PileStatus.COMPLETED]: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    [PileStatus.PENDING_TEST]: { bg: 'bg-violet-500/10', text: 'text-violet-400', dot: 'bg-violet-500' }
  };

  const isDrilled = drillBuilding && drillSection;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">进度看板</h1>
          <p className="text-sm text-slate-400 mt-1">
            实时查看各楼栋桩位施工状态
            {isDrilled && (
              <span className="ml-2 text-blue-400">· 下钻: {drillBuilding} {drillSection}</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="总桩数"
          value={stats.total}
          unit="根"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="已完成"
          value={stats.statusCounts[PileStatus.COMPLETED]}
          unit={`根 · ${stats.completionRate}%`}
          icon={CheckCircle2}
          color="green"
          trend={5.2}
          trendLabel="较昨日"
        />
        <StatCard
          title="施工中"
          value={stats.statusCounts[PileStatus.DRILLING] + stats.statusCounts[PileStatus.PENDING_POUR]}
          unit="根"
          icon={Drill}
          color="amber"
        />
        <StatCard
          title="待处理风险"
          value={stats.highRisks}
          unit="项"
          icon={AlertTriangle}
          color="red"
          onClick={() => navigate('/risks')}
        />
      </div>

      <div className="grid grid-cols-5 gap-3">
        {(Object.keys(PileStatusText) as PileStatus[]).map((status) => {
          const count = stats.statusCounts[status];
          const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          const c = statusColorMap[status];

          return (
            <div
              key={status}
              className={`${c.bg} border border-current/20 rounded-xl p-4 transition-transform hover:scale-105`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`text-xs ${c.text}`}>{PileStatusText[status]}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-bold ${c.text}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {count}
                </span>
                <span className="text-xs text-slate-500">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <FilterBar />

      <SectionHeatmap
        onBuildingClick={handleBuildingClick}
        activeBuilding={drillBuilding}
        activeDrillSection={drillSection}
        onClearDrill={handleClearDrill}
      />

      <PileGrid highlightMode={isDrilled ? 'active' : 'normal'} />

      <PileDetailModal />
    </div>
  );
}
