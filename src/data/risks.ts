import type { Risk } from '@/types';
import { RiskType, RiskLevel, RiskStatus } from '@/types';

const pileIdsWithRisks = [
  '1#楼-A3-012',
  '1#楼-C5-034',
  '2#楼-B2-101',
  '2#楼-E7-128',
  '3#楼-D4-215',
  '3#楼-F6-256',
  '1#楼-G8-067',
  '2#楼-A1-089',
  '3#楼-C3-203',
  '1#楼-E2-045',
  '2#楼-H5-167',
  '3#楼-B7-278'
];

const riskDescriptions: Record<RiskType, string[]> = {
  [RiskType.NO_UPDATE]: [
    '该桩成孔中状态已超过48小时未更新',
    '施工数据连续3天未录入系统',
    '班组未按时提交日报'
  ],
  [RiskType.POUR_INTERVAL]: [
    '终孔后超过12小时未灌注混凝土',
    '成孔完成后灌注准备时间过长',
    '混凝土供应延迟导致待灌注超时'
  ],
  [RiskType.NO_TEST_RESULT]: [
    '已完成桩超过7天未提交检测报告',
    '检测完成但结果未录入系统',
    '第三方检测机构反馈延迟'
  ]
};

function generateRisks(): Risk[] {
  const risks: Risk[] = [];
  const riskTypes = [RiskType.NO_UPDATE, RiskType.POUR_INTERVAL, RiskType.NO_TEST_RESULT];

  pileIdsWithRisks.forEach((pileId, index) => {
    const type = riskTypes[index % 3];
    const level = index < 4 ? RiskLevel.HIGH : index < 8 ? RiskLevel.MEDIUM : RiskLevel.LOW;
    const status = index < 2 ? RiskStatus.PROCESSING : RiskStatus.PENDING;

    risks.push({
      id: `RISK-${String(index + 1).padStart(4, '0')}`,
      pileId,
      type,
      level,
      durationHours: Math.floor(Math.random() * 72) + 12,
      description: riskDescriptions[type][Math.floor(Math.random() * riskDescriptions[type].length)],
      status,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 72) * 3600000).toISOString()
    });
  });

  return risks.sort((a, b) => {
    const levelOrder = { [RiskLevel.HIGH]: 0, [RiskLevel.MEDIUM]: 1, [RiskLevel.LOW]: 2 };
    return levelOrder[a.level] - levelOrder[b.level] || b.durationHours - a.durationHours;
  });
}

export const risks = generateRisks();
