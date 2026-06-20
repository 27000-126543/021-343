import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Filter, AlertOctagon, Clock, FileX } from 'lucide-react';
import RiskCard from '@/components/RiskCard/RiskCard';
import { useAppStore } from '@/store/useAppStore';
import { RiskType, RiskTypeText, RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

const riskTabs = [
  { key: 'all', label: '全部', icon: AlertTriangle },
  { key: RiskType.NO_UPDATE, label: RiskTypeText[RiskType.NO_UPDATE], icon: Clock },
  { key: RiskType.POUR_INTERVAL, label: RiskTypeText[RiskType.POUR_INTERVAL], icon: AlertOctagon },
  { key: RiskType.NO_TEST_RESULT, label: RiskTypeText[RiskType.NO_TEST_RESULT], icon: FileX }
];

export default function RiskAlert() {
  const navigate = useNavigate();
  const { riskFilter, setRiskFilter, getFilteredRisks, setFilters, setSelectedPile, setShowPileDetail, piles } = useAppStore();

  const filteredRisks = getFilteredRisks();

  const { pinnedRisks, normalRisks, stats } = useMemo(() => {
    const pinned = filteredRisks.filter((r) => r.level === RiskLevel.HIGH);
    const normal = filteredRisks.filter((r) => r.level !== RiskLevel.HIGH);

    const typeStats = {
      [RiskType.NO_UPDATE]: filteredRisks.filter((r) => r.type === RiskType.NO_UPDATE).length,
      [RiskType.POUR_INTERVAL]: filteredRisks.filter((r) => r.type === RiskType.POUR_INTERVAL).length,
      [RiskType.NO_TEST_RESULT]: filteredRisks.filter((r) => r.type === RiskType.NO_TEST_RESULT).length
    };

    return {
      pinnedRisks: pinned,
      normalRisks: normal,
      stats: {
        total: filteredRisks.length,
        high: filteredRisks.filter((r) => r.level === RiskLevel.HIGH).length,
        medium: filteredRisks.filter((r) => r.level === RiskLevel.MEDIUM).length,
        low: filteredRisks.filter((r) => r.level === RiskLevel.LOW).length,
        ...typeStats
      }
    };
  }, [filteredRisks]);

  const handleLocate = (pileId: string) => {
    const pile = piles.find((p) => p.id === pileId);
    if (pile) {
      setFilters({
        building: pile.building,
        section: pile.section,
        status: 'all',
        axis: '',
        rigId: 'all'
      });
      setSelectedPile(pile);
      setShowPileDetail(true);
      navigate('/');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">风险提醒</h1>
          <p className="text-sm text-slate-400 mt-1">及时发现并处理施工异常</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-1">风险总数</p>
          <p
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {stats.total}
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-xs text-red-400 mb-1">高风险</p>
          <p
            className="text-3xl font-bold text-red-400"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {stats.high}
          </p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-xs text-orange-400 mb-1">中风险</p>
          <p
            className="text-3xl font-bold text-orange-400"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {stats.medium}
          </p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-xs text-yellow-400 mb-1">低风险</p>
          <p
            className="text-3xl font-bold text-yellow-400"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {stats.low}
          </p>
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">风险类型</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {riskTabs.map((tab) => {
            const count = tab.key === 'all' ? stats.total : stats[tab.key as keyof typeof stats] as number;
            const isActive = riskFilter === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setRiskFilter(tab.key as RiskType | 'all')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-xs font-mono',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {pinnedRisks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">
              高风险置顶 ({pinnedRisks.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedRisks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} onLocate={handleLocate} isPinned />
            ))}
          </div>
        </div>
      )}

      {normalRisks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              其他风险 ({normalRisks.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalRisks.map((risk) => (
              <RiskCard key={risk.id} risk={risk} onLocate={handleLocate} />
            ))}
          </div>
        </div>
      )}

      {filteredRisks.length === 0 && (
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">暂无风险</h3>
          <p className="text-sm text-slate-400">当前筛选条件下没有发现风险项</p>
        </div>
      )}
    </div>
  );
}
