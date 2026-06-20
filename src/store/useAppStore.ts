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
  setFilters: (filters: Partial<FilterState>) => void;
  setSelectedPile: (pile: Pile | null) => void;
  setShowPileDetail: (show: boolean) => void;
  setSelectedDate: (date: string) => void;
  setRiskFilter: (filter: RiskType | 'all') => void;
  getFilteredPiles: () => Pile[];
  getFilteredRisks: () => Risk[];
  getDailyStats: (date: string) => {
    totalCompleted: number;
    totalMeters: number;
    avgRigProductivity: number;
    abnormalCount: number;
  };
  getTrendData: (days: number) => { date: string; completed: number; meters: number }[];
  getRigRanking: (date: string) => { rig: Rig; completed: number; meters: number; downtime: number }[];
  getAbnormalReasons: (date: string) => { reason: string; count: number }[];
  hasRisk: (pileId: string) => boolean;
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

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    })),

  setSelectedPile: (pile) => set({ selectedPile: pile }),

  setShowPileDetail: (show) => set({ showPileDetail: show }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setRiskFilter: (filter) => set({ riskFilter: filter }),

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

  getDailyStats: (date) => {
    const { dailyRecords, rigs } = get();
    const dayRecords = dailyRecords.filter((r) => r.date === date);
    const totalCompleted = dayRecords.reduce((sum, r) => sum + r.completedCount, 0);
    const totalMeters = dayRecords.reduce((sum, r) => sum + r.dailyMeters, 0);
    const runningRigs = rigs.filter((r) => r.status === 'running').length;
    const avgRigProductivity = runningRigs > 0 ? totalCompleted / runningRigs : 0;
    const abnormalCount = dayRecords.filter((r) => r.abnormalReason !== null).length;

    return {
      totalCompleted,
      totalMeters: Math.round(totalMeters * 10) / 10,
      avgRigProductivity: Math.round(avgRigProductivity * 10) / 10,
      abnormalCount
    };
  },

  getTrendData: (days) => {
    const { dailyRecords } = get();
    const dates: string[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    return dates.map((date) => {
      const dayRecords = dailyRecords.filter((r) => r.date === date);
      return {
        date: date.slice(5),
        completed: dayRecords.reduce((sum, r) => sum + r.completedCount, 0),
        meters: Math.round(dayRecords.reduce((sum, r) => sum + r.dailyMeters, 0) * 10) / 10
      };
    });
  },

  getRigRanking: (date) => {
    const { dailyRecords, rigs } = get();
    const dayRecords = dailyRecords.filter((r) => r.date === date);

    return rigs
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

  getAbnormalReasons: (date) => {
    const { dailyRecords } = get();
    const records = dailyRecords.filter((r) => r.date <= date && r.date >= getDateBefore(date, 7) && r.abnormalReason);
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
