import type { Rig, Crew } from '@/types';

export const rigs: Rig[] = [
  { id: 'RIG-001', model: '徐工XR280D', operator: '张建国', status: 'running' },
  { id: 'RIG-002', model: '中联重科ZR220A', operator: '李明华', status: 'running' },
  { id: 'RIG-003', model: '三一SR250R', operator: '王志强', status: 'running' },
  { id: 'RIG-004', model: '徐工XR220D', operator: '赵德胜', status: 'idle' },
  { id: 'RIG-005', model: '山河智能SWDM22', operator: '刘建军', status: 'running' },
  { id: 'RIG-006', model: '金泰SH36', operator: '陈宏伟', status: 'maintenance' },
  { id: 'RIG-007', model: '徐工XR360E', operator: '周明辉', status: 'running' },
  { id: 'RIG-008', model: '中联重科ZR280C', operator: '吴光明', status: 'running' }
];

export const crews: Crew[] = [
  { id: 'CREW-01', name: '桩基一班', foreman: '张建国', memberCount: 8 },
  { id: 'CREW-02', name: '桩基二班', foreman: '李明华', memberCount: 7 },
  { id: 'CREW-03', name: '桩基三班', foreman: '王志强', memberCount: 9 },
  { id: 'CREW-04', name: '桩基四班', foreman: '赵德胜', memberCount: 6 }
];
