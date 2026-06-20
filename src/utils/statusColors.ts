import { PileStatus, RiskLevel, RiskType } from '@/types';

export const statusColors: Record<PileStatus, { bg: string; text: string; border: string; dot: string }> = {
  [PileStatus.NOT_STARTED]: {
    bg: 'bg-gray-500',
    text: 'text-gray-500',
    border: 'border-gray-500',
    dot: '#6B7280'
  },
  [PileStatus.DRILLING]: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    dot: '#3B82F6'
  },
  [PileStatus.PENDING_POUR]: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    dot: '#F59E0B'
  },
  [PileStatus.COMPLETED]: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    border: 'border-emerald-500',
    dot: '#10B981'
  },
  [PileStatus.PENDING_TEST]: {
    bg: 'bg-violet-500',
    text: 'text-violet-500',
    border: 'border-violet-500',
    dot: '#8B5CF6'
  }
};

export const riskLevelColors: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  [RiskLevel.HIGH]: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500'
  },
  [RiskLevel.MEDIUM]: {
    bg: 'bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500'
  },
  [RiskLevel.LOW]: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-500',
    border: 'border-yellow-500'
  }
};

export const riskTypeColors: Record<RiskType, { bg: string; text: string }> = {
  [RiskType.NO_UPDATE]: {
    bg: 'bg-rose-100',
    text: 'text-rose-700'
  },
  [RiskType.POUR_INTERVAL]: {
    bg: 'bg-orange-100',
    text: 'text-orange-700'
  },
  [RiskType.NO_TEST_RESULT]: {
    bg: 'bg-amber-100',
    text: 'text-amber-700'
  }
};

export const getPileStatusBgClass = (status: PileStatus, hasRisk: boolean): string => {
  if (hasRisk) {
    return 'bg-red-500 animate-pulse-risk';
  }
  const colors = statusColors[status];
  return colors.bg;
};
