import { create } from 'zustand';
import { piles } from '@/data/piles';
import { dailyRecords, planItems } from '@/data/dailyRecords';
import { risks as initialRisks } from '@/data/risks';
import { rigs, crews } from '@/data/rigs';
import type { Pile, DailyRecord, Risk, Rig, Crew, FilterState, PileStatus, RiskType, RiskResolution } from '@/types';
import { RiskLevel, RiskStatus } from '@/types';

interface SectionHeatmapItem {
  building: string;
  total: number;
  completed: number;
  inProgress: number;
  riskCount: number;
  completionRate: number;
}

interface PlanComparisonItem {
  section: string;
  planned: number;
  actual: number;
  deviation: number;
  completionRate: number;
}

interface AppState {
  piles: Pile[];
  dailyRecords: DailyRecord[];
  risks: Risk[];
  rigs: Rig[];
  crews: Crew[];
  filters: FilterState;
  selectedPile: Pile | null;
  showPileDetail: boolean;
  selectedDate: string;
  riskFilter: RiskType | 'all';
  highlightedPileId: string | null;
  dailySectionFilter: string;
  setFilters: (filters: Partial<FilterState>) => void;
  setSelectedPile: (pile: Pile | null) => void;
  setShowPileDetail: (show: boolean) => void;
  setSelectedDate: (date: string) => void;
  setRiskFilter: (filter: RiskType | 'all') => void;
  setHighlightedPileId: (id: string | null) => void;
  setDailySectionFilter: (section: string) => void;
  updateRiskResolution: (riskId: string, resolution: RiskResolution, newStatus: RiskStatus) => void;
  getFilteredPiles: () => Pile[];
  getFilteredRisks: () => Risk[];
  getDailyStats: (date: string, section?: string) => {
    totalCompleted: number;
    dailyMeters: number;
    cumulativeMeters: number;
    avgRigProductivity: number;
    abnormalCount: number;
  };
  getTrendData: (days: number, section?: string, endDate?: string) => { date: string; fullDate: string; completed: number; dailyMeters: number; cumulativeMeters: number }[];
  getRigRanking: (date: string, section?: string) => { rig: Rig; completed: number; meters: number; downtime: number }[];
  getAbnormalReasons: (date: string, section?: string) => { reason: string; count: number }[];
  getPlanComparison: (date: string, section?: string) => PlanComparisonItem[];
  getSectionHeatmap: (section: string) => SectionHeatmapItem[];
  hasRisk: (pileId: string) => boolean;
  getRisksForPile: (pileId: string) => Risk[];
}

const initialFilters: FilterState = {
  building: 'all',
  axis: '',
  section: 'all',
  status: 'all',
  rigId: 'all'
};

export const useAppStore = create<AppState>((set, get) => ({
  piles,
  dailyRecords,
  risks: initialRisks,
  rigs,
  crews,
  filters: initialFilters,
  selectedPile: null,
  showPileDetail: false,
  selectedDate: new Date().toISOString().split('T')[0],
  riskFilter: 'all',
  highlightedPileId: null,
  dailySectionFilter: 'all',

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  setSelectedPile: (pile) => set({ selectedPile: pile }),
  setShowPileDetail: (show) => set({ showPileDetail: show }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setRiskFilter: (filter) => set({ riskFilter: filter }),
  setHighlightedPileId: (id) => set({ highlightedPileId: id }),
  setDailySectionFilter: (section) => set({ dailySectionFilter: section }),

  updateRiskResolution: (riskId, resolution, newStatus) =>
    set((state) => ({
      risks: state.risks.map((r) =>
        r.id === riskId ? { ...r, resolution, status: newStatus } : r
      )
    })),

  getFilteredPiles: () => {
    const { piles, filters } = get();
    return piles.filter((pile) => {
      if (filters.building !== 'all' && pile.building !== filters.building) return false;
      if (filters.section !== 'all' && pile.section !== filters.section) return false;
      if (filters.status !== 'all' && pile.status !== filters.status) return false;
      if (filters.rigId !== 'all' && pile.rigId !== filters.rigId) return false;
      if (filters.axis && !pile.axis.toLowerCase().includes(filters.axis.toLowerCase())) return false;
      return true;
    });
  },

  getFilteredRisks: () => {
    const { risks, riskFilter } = get();
    if (riskFilter === 'all') return risks;
    return risks.filter((r) => r.type === riskFilter);
  },

  getDailyStats: (date, section) => {
    const { dailyRecords, rigs } = get();
    const dayRecords = dailyRecords.filter((r) => {
      if (r.date !== date) return false;
      if (section && section !== 'all' && r.section !== section) return false;
      return true;
    });

    const totalCompleted = dayRecords.reduce((sum, r) => sum + r.completedCount, 0);
    const dailyMeters = dayRecords.reduce((sum, r) => sum + r.dailyMeters, 0);

    const allRecordsBefore = dailyRecords.filter((r) => {
      if (r.date > date) return false;
      if (section && section !== 'all' && r.section !== section) return false;
      return true;
    });
    const cumulativeMeters = allRecordsBefore.reduce((sum, r) => sum + r.dailyMeters, 0);

    const activeRigIds = new Set(dayRecords.filter((r) => r.completedCount > 0).map((r) => r.rigId));
    const activeRigCount = activeRigIds.size || rigs.filter((r) => r.status === 'running').length;
    const avgRigProductivity = activeRigCount > 0 ? totalCompleted / activeRigCount : 0;
    const abnormalCount = dayRecords.filter((r) => r.abnormalReason !== null).length;

    return {
      totalCompleted,
      dailyMeters: Math.round(dailyMeters * 10) / 10,
      cumulativeMeters: Math.round(cumulativeMeters * 10) / 10,
      avgRigProductivity: Math.round(avgRigProductivity * 10) / 10,
      abnormalCount
    };
  },

  getTrendData: (days, section, endDate) => {
    const { dailyRecords } = get();
    const end = endDate || new Date().toISOString().split('T')[0];

    const dates: string[] = [];
    const endDateObj = new Date(end);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(endDateObj);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    let runningCumulative = 0;
    const earliestDate = dates[0];
    const recordsBefore = dailyRecords.filter((r) => {
      if (r.date >= earliestDate) return false;
      if (section && section !== 'all' && r.section !== section) return false;
      return true;
    });
    runningCumulative = recordsBefore.reduce((sum, r) => sum + r.dailyMeters, 0);

    return dates.map((date) => {
      const dayRecords = dailyRecords.filter((r) => {
        if (r.date !== date) return false;
        if (section && section !== 'all' && r.section !== section) return false;
        return true;
      });

      const completed = dayRecords.reduce((sum, r) => sum + r.completedCount, 0);
      const dm = dayRecords.reduce((sum, r) => sum + r.dailyMeters, 0);
      runningCumulative += dm;

      return {
        date: date.slice(5),
        fullDate: date,
        completed,
        dailyMeters: Math.round(dm * 10) / 10,
        cumulativeMeters: Math.round(runningCumulative * 10) / 10
      };
    });
  },

  getRigRanking: (date, section) => {
    const { dailyRecords, rigs } = get();
    const dayRecords = dailyRecords.filter((r) => {
      if (r.date !== date) return false;
      if (section && section !== 'all' && r.section !== section) return false;
      return true;
    });

    const rigData = new Map<string, { completed: number; meters: number; downtime: number }>();
    dayRecords.forEach((r) => {
      const existing = rigData.get(r.rigId) || { completed: 0, meters: 0, downtime: 0 };
      existing.completed += r.completedCount;
      existing.meters += r.dailyMeters;
      existing.downtime += r.downtimeHours;
      rigData.set(r.rigId, existing);
    });

    return rigs
      .filter((rig) => !section || section === 'all' || rigData.has(rig.id))
      .map((rig) => {
        const data = rigData.get(rig.id) || { completed: 0, meters: 0, downtime: 0 };
        return { rig, ...data };
      })
      .sort((a, b) => b.completed - a.completed || b.meters - a.meters);
  },

  getAbnormalReasons: (date, section) => {
    const { dailyRecords } = get();
    const records = dailyRecords.filter((r) => {
      if (r.date > date || r.date < getDateBefore(date, 7)) return false;
      if (!r.abnormalReason) return false;
      if (section && section !== 'all' && r.section !== section) return false;
      return true;
    });

    const reasonMap = new Map<string, number>();
    records.forEach((r) => {
      if (r.abnormalReason) {
        reasonMap.set(r.abnormalReason, (reasonMap.get(r.abnormalReason) || 0) + 1);
      }
    });

    return Array.from(reasonMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);
  },

  getPlanComparison: (date, section) => {
    const { dailyRecords } = get();
    const sections = section && section !== 'all' ? [section] : ['A区', 'B区', 'C区', 'D区'];

    return sections.map((sec) => {
      const plan = planItems.find((p) => p.date === date && p.section === sec);
      const actualRecords = dailyRecords.filter((r) => r.date === date && r.section === sec);
      const actual = actualRecords.reduce((sum, r) => sum + r.completedCount, 0);
      const planned = plan?.plannedCount || 0;
      const deviation = actual - planned;
      const completionRate = planned > 0 ? Math.round((actual / planned) * 100) : 0;

      return { section: sec, planned, actual, deviation, completionRate };
    });
  },

  getSectionHeatmap: (section) => {
    const { piles, risks } = get();
    const buildings = ['1#楼', '2#楼', '3#楼'];

    return buildings.map((building) => {
      const sectionPiles = piles.filter((p) => p.building === building && p.section === section);
      const total = sectionPiles.length;
      const completed = sectionPiles.filter((p) => p.status === 'completed').length;
      const inProgress = sectionPiles.filter(
        (p) => p.status === 'drilling' || p.status === 'pending_pour'
      ).length;
      const riskCount = risks.filter(
        (r) => r.pileId.startsWith(building) && r.status !== RiskStatus.RESOLVED
      ).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { building, total, completed, inProgress, riskCount, completionRate };
    });
  },

  hasRisk: (pileId) => {
    const { risks } = get();
    return risks.some((r) => r.pileId === pileId);
  },

  getRisksForPile: (pileId) => {
    const { risks } = get();
    return risks.filter((r) => r.pileId === pileId);
  }
}));

function getDateBefore(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
