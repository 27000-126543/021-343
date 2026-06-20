export enum PileStatus {
  NOT_STARTED = 'not_started',
  DRILLING = 'drilling',
  PENDING_POUR = 'pending_pour',
  COMPLETED = 'completed',
  PENDING_TEST = 'pending_test'
}

export enum RiskType {
  NO_UPDATE = 'no_update',
  POUR_INTERVAL = 'pour_interval',
  NO_TEST_RESULT = 'no_test_result'
}

export enum RiskLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum RiskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  RESOLVED = 'resolved'
}

export interface Pile {
  id: string;
  building: string;
  axis: string;
  section: string;
  status: PileStatus;
  row: number;
  col: number;
  rigId: string | null;
  crewId: string | null;
  detail: PileDetail | null;
}

export interface PileDetail {
  pileId: string;
  drillStartTime: string;
  drillEndTime: string | null;
  finalDepth: number | null;
  concreteVolume: number | null;
  designer: string;
  inspector: string | null;
  lastUpdateTime: string;
}

export interface DailyRecord {
  date: string;
  rigId: string;
  section: string;
  completedCount: number;
  dailyMeters: number;
  abnormalReason: string | null;
  downtimeHours: number;
}

export interface Rig {
  id: string;
  model: string;
  operator: string;
  status: 'running' | 'idle' | 'maintenance';
}

export interface Crew {
  id: string;
  name: string;
  foreman: string;
  memberCount: number;
}

export interface Risk {
  id: string;
  pileId: string;
  type: RiskType;
  level: RiskLevel;
  durationHours: number;
  description: string;
  status: RiskStatus;
  createdAt: string;
  resolution?: RiskResolution;
}

export interface RiskResolution {
  opinion: string;
  assignee: string;
  dueDate: string;
  resolvedAt?: string;
}

export interface FilterState {
  building: string;
  axis: string;
  section: string;
  status: PileStatus | 'all';
  rigId: string;
}

export interface DailyStats {
  date: string;
  totalCompleted: number;
  dailyMeters: number;
  cumulativeMeters: number;
  avgRigProductivity: number;
  abnormalCount: number;
}

export interface PlanItem {
  date: string;
  section: string;
  plannedCount: number;
}

export const PileStatusText: Record<PileStatus, string> = {
  [PileStatus.NOT_STARTED]: '未开工',
  [PileStatus.DRILLING]: '成孔中',
  [PileStatus.PENDING_POUR]: '待灌注',
  [PileStatus.COMPLETED]: '已完成',
  [PileStatus.PENDING_TEST]: '待检测'
};

export const RiskTypeText: Record<RiskType, string> = {
  [RiskType.NO_UPDATE]: '连续未更新',
  [RiskType.POUR_INTERVAL]: '灌注间隔过长',
  [RiskType.NO_TEST_RESULT]: '检测结果未回填'
};

export const RiskLevelText: Record<RiskLevel, string> = {
  [RiskLevel.HIGH]: '高',
  [RiskLevel.MEDIUM]: '中',
  [RiskLevel.LOW]: '低'
};

export const RigStatusText: Record<Rig['status'], string> = {
  running: '运行中',
  idle: '闲置',
  maintenance: '维护中'
};

export const RiskStatusText: Record<RiskStatus, string> = {
  [RiskStatus.PENDING]: '待处理',
  [RiskStatus.PROCESSING]: '处理中',
  [RiskStatus.RESOLVED]: '已解决'
};
