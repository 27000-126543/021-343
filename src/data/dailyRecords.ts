import type { DailyRecord } from '@/types';

const rigIds = ['RIG-001', 'RIG-002', 'RIG-003', 'RIG-004', 'RIG-005', 'RIG-006', 'RIG-007', 'RIG-008'];

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

      const baseCount = Math.floor((2 + Math.random() * 4) * efficiency);
      const completedCount = isMaintenance || isIdle ? 0 : baseCount;
      const dailyMeters = completedCount * (20 + Math.random() * 30);
      const totalMeters = (30 - daysAgo) * dailyMeters * 0.8;

      const hasAbnormal = Math.random() < 0.15 && !isMaintenance && !isIdle;
      const abnormalReason = hasAbnormal
        ? abnormalReasons[Math.floor(Math.random() * abnormalReasons.length)]
        : null;
      const downtimeHours = hasAbnormal ? Math.floor(Math.random() * 8) + 1 : 0;

      records.push({
        date: dateStr,
        rigId,
        completedCount,
        totalMeters: Math.round(totalMeters * 10) / 10,
        dailyMeters: Math.round(dailyMeters * 10) / 10,
        abnormalReason,
        downtimeHours
      });
    });
  }

  return records;
}

export const dailyRecords = generateDailyRecords();
