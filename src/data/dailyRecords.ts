import type { DailyRecord, PlanItem } from '@/types';

const rigIds = ['RIG-001', 'RIG-002', 'RIG-003', 'RIG-004', 'RIG-005', 'RIG-006', 'RIG-007', 'RIG-008'];
const sections = ['A区', 'B区', 'C区', 'D区'];
const rigSectionMap: Record<string, string[]> = {
  'RIG-001': ['A区', 'B区'],
  'RIG-002': ['A区', 'C区'],
  'RIG-003': ['B区', 'D区'],
  'RIG-004': ['C区'],
  'RIG-005': ['A区', 'D区'],
  'RIG-006': ['B区', 'C区'],
  'RIG-007': ['C区', 'D区'],
  'RIG-008': ['A区', 'B区', 'D区']
};

const abnormalReasons = [
  '地质条件复杂',
  '设备故障',
  '材料供应不足',
  '天气原因',
  '图纸变更',
  '人员短缺',
  '停电',
  '检测待等'
];

function generateDailyRecords(): DailyRecord[] {
  const records: DailyRecord[] = [];
  const today = new Date();

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const efficiency = isWeekend ? 0.6 : 1;

    rigIds.forEach((rigId) => {
      const isMaintenance = rigId === 'RIG-006' && daysAgo < 5;
      const isIdle = rigId === 'RIG-004' && daysAgo < 3;
      const rigSections = rigSectionMap[rigId] || ['A区'];

      const baseCount = Math.floor((2 + Math.random() * 4) * efficiency);
      const totalForRig = isMaintenance || isIdle ? 0 : baseCount;

      const perSection = totalForRig / rigSections.length;
      const remainder = totalForRig - Math.floor(perSection) * rigSections.length;

      rigSections.forEach((section, idx) => {
        const completedCount = Math.floor(perSection) + (idx < remainder ? 1 : 0);
        const dailyMeters = completedCount * (20 + Math.random() * 30);

        const hasAbnormal = Math.random() < 0.12 && completedCount > 0;
        const abnormalReason = hasAbnormal
          ? abnormalReasons[Math.floor(Math.random() * abnormalReasons.length)]
          : null;
        const downtimeHours = hasAbnormal ? Math.floor(Math.random() * 6) + 1 : 0;

        records.push({
          date: dateStr,
          rigId,
          section,
          completedCount,
          dailyMeters: Math.round(dailyMeters * 10) / 10,
          abnormalReason,
          downtimeHours
        });
      });
    });
  }

  return records;
}

function generatePlanItems(): PlanItem[] {
  const items: PlanItem[] = [];
  const today = new Date();

  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split('T')[0];

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const basePlan = isWeekend ? 8 : 14;

    sections.forEach((section) => {
      const sectionFactor = section === 'A区' ? 1.1 : section === 'B区' ? 1.0 : section === 'C区' ? 0.9 : 0.85;
      const plannedCount = Math.round(basePlan * sectionFactor + (Math.random() * 4 - 2));

      items.push({
        date: dateStr,
        section,
        plannedCount: Math.max(plannedCount, 4)
      });
    });
  }

  return items;
}

export const dailyRecords = generateDailyRecords();
export const planItems = generatePlanItems();
