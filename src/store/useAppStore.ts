import { create } from 'zustand';
import { piles } from '@/data/piles';
import { dailyRecords } from '@/data/dailyRecords';
import { risks } from '@/data/risks';
import { rigs, crews } from '@/data/rigs';
import type { Pile, DailyRecord, Risk, Rig, Crew, FilterState, PileStatus, RiskType } from '@/types';
import { RiskLevel } from '@/types';

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
  getFilteredPiles: () => Pile[];
  getFilteredRisks: () => Risk[];
  getDailyStats: (date: string, section?: string) => {
    totalCompleted: number;
    dailyMeters: number;
    cumulativeMeters: number;
    avgRigProductivity: number;
    abnormalCount: number;
  };
  getTrendData: (days: number, section?: string) => { date: string; completed: number; dailyMeters: number; cumulativeMeters: number }[];
  getRigRanking: (date: string, section?: string) => { rig: Rig; completed: number; meters: number; downtime: number }[];
  getAbnormalReasons: (date: string, section?: string) => { reason: string; count: number }[];
  hasRisk: (pileId: string) => boolean;
  getRigsInSection: (section: string) => string[];
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
  risks,
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

  getFilteredPiles: () => {
    const { piles, filters, highlightedPileId } = get();
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

  getRigsInSection: (section) => {
    const { piles } = get();
    const rigIdSet = new Set<string>();
    piles.forEach((p) => {
      if (p.section === section && p.rigId) {
        rigIdSet.add(p.rigId);
      }
    });
    return Array.from(rigIdSet);
  },

  getDailyStats: (date, section) => {
    const { dailyRecords, rigs, piles } = get();
    const sectionRigIds = section && section !== 'all'
      ? (() => {
          const s = new Set<string>();
          piles.forEach((p) => { if (p.section === section && p.rigId) s.add(p.rigId); });
          return s;
        })()
      : null;

    const dayRecords = dailyRecords.filter((r) => {
      if (r.date !== date) return false;
      if (sectionRigIds && !sectionRigIds.has(r.rigId)) return false;
      return true;
    });

    const totalCompleted = dayRecords.reduce((sum, r) => sum + r.completedCount, 0);
    const dailyMeters = dayRecords.reduce((sum, r) => sum + r.dailyMeters, 0);

    const allRecordsBefore = dailyRecords.filter((r) => {
      if (r.date > date) return false;
      if (sectionRigIds && !sectionRigIds.has(r.rigId)) return false;
      return true;
    });
    const cumulativeMeters = allRecordsBefore.reduce((sum, r) => sum + r.dailyMeters, 0);

    const activeRigCount = sectionRigIds
      ? rigs.filter((r) => sectionRigIds.has(r.id) && r.status === 'running').length
      : rigs.filter((r) => r.status === 'running').length;
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

  getTrendData: (days, section) => {
    const { dailyRecords, piles } = get();
    const sectionRigIds = section && section !== 'all'
      ? (() => {
          const s = new Set<string>();
          piles.forEach((p) => { if (p.section === section && p.rigId) s.add(p.rigId); });
          return s;
        })()
      : null;

    const dates: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    let runningCumulative = 0;

    const earliestDate = dates[0];
    const recordsBefore = dailyRecords.filter((r) => {
      if (r.date >= earliestDate) return false;
      if (sectionRigIds && !sectionRigIds.has(r.rigId)) return false;
      return true;
    });
    runningCumulative = recordsBefore.reduce((sum, r) => sum + r.dailyMeters, 0);

    return dates.map((date) => {
      const dayRecords = dailyRecords.filter((r) => {
        if (r.date !== date) return false;
        if (sectionRigIds && !sectionRigIds.has(r.rigId)) return false;
        return true;
      });

      const completed = dayRecords.reduce((sum, r) => sum + r.completedCount, 0);
      const dm = dayRecords.reduce((sum, r) => sum + r.dailyMeters, 0);
      runningCumulative += dm;

      return {
        date: date.slice(5),
        completed,
        dailyMeters: Math.round(dm * 10) / 10,
        cumulativeMeters: Math.round(runningCumulative * 10) / 10
      };
    });
  },

  getRigRanking: (date, section) => {
    const { dailyRecords, rigs, piles } = get();
    const sectionRigIds = section && section !== 'all'
      ? (() => {
          const s = new Set<string>();
          piles.forEach((p) => { if (p.section === section && p.rigId) s.add(p.rigId); });
          return s;
        })()
      : null;

    const dayRecords = dailyRecords.filter((r) => r.date === date);

    const targetRigs = sectionRigIds
      ? rigs.filter((r) => sectionRigIds.has(r.id))
      : rigs;

    return targetRigs
      .map((rig) => {
        const record = dayRecords.find((r) => r.rigId === rig.id);
        return {
          rig,
          completed: record?.completedCount || 0,
          meters: record?.dailyMeters || 0,
          downtime: record?.downtimeHours || 0
        };
      })
      .sort((a, b) => b.completed - a.completed || b.meters - a.meters);
  },

  getAbnormalReasons: (date, section) => {
    const { dailyRecords, piles } = get();
    const sectionRigIds = section && section !== 'all'
      ? (() => {
          const s = new Set<string>();
          piles.forEach((p) => { if (p.section === section && p.rigId) s.add(p.rigId); });
          return s;
        })()
      : null;

    const records = dailyRecords.filter((r) => {
      if (r.date > date || r.date < getDateBefore(date, 7)) return false;
      if (!r.abnormalReason) return false;
      if (sectionRigIds && !sectionRigIds.has(r.rigId)) return false;
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

  hasRisk: (pileId) => {
    const { risks } = get();
    return risks.some((r) => r.pileId === pileId);
  }
}));

function getDateBefore(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}
