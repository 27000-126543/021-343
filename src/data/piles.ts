import type { Pile, PileStatus } from '@/types';
import { PileStatus as Status } from '@/types';

const buildings = ['1#楼', '2#楼', '3#楼'];
const sections = ['A区', 'B区', 'C区', 'D区'];
const axisRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const axisCols = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const statuses: PileStatus[] = [
  Status.NOT_STARTED,
  Status.DRILLING,
  Status.PENDING_POUR,
  Status.COMPLETED,
  Status.PENDING_TEST
];

const rigIds = ['RIG-001', 'RIG-002', 'RIG-003', 'RIG-004', 'RIG-005', 'RIG-006', 'RIG-007', 'RIG-008'];
const crewIds = ['CREW-01', 'CREW-02', 'CREW-03', 'CREW-04'];
const designers = ['张伟', '李娜', '王磊', '刘洋', '陈静'];
const inspectors = ['赵工', '钱工', '孙工', '周工'];

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(8 + Math.floor(Math.random() * 12));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
}

function weightedStatus(): PileStatus {
  const rand = Math.random();
  if (rand < 0.35) return Status.NOT_STARTED;
  if (rand < 0.5) return Status.DRILLING;
  if (rand < 0.6) return Status.PENDING_POUR;
  if (rand < 0.85) return Status.COMPLETED;
  return Status.PENDING_TEST;
}

function generatePileDetail(status: PileStatus, pileId: string) {
  if (status === Status.NOT_STARTED) return null;

  const startTime = randomDate(30);
  const endTime = [Status.PENDING_POUR, Status.COMPLETED, Status.PENDING_TEST].includes(status)
    ? randomDate(10)
    : null;

  return {
    pileId,
    drillStartTime: startTime,
    drillEndTime: endTime,
    finalDepth: endTime ? Math.round((20 + Math.random() * 30) * 10) / 10 : null,
    concreteVolume: [Status.COMPLETED, Status.PENDING_TEST].includes(status)
      ? Math.round((8 + Math.random() * 12) * 10) / 10
      : null,
    designer: designers[Math.floor(Math.random() * designers.length)],
    inspector: status === Status.PENDING_TEST ? null : inspectors[Math.floor(Math.random() * inspectors.length)],
    lastUpdateTime: randomDate(2)
  };
}

function generatePiles(): Pile[] {
  const piles: Pile[] = [];
  let pileIndex = 1;

  buildings.forEach((building, buildingIdx) => {
    sections.forEach((section, sectionIdx) => {
      axisRows.forEach((row, rowIdx) => {
        axisCols.forEach((col, colIdx) => {
          if (Math.random() > 0.75) return;

          const status = weightedStatus();
          const pileId = `${building}-${row}${col}-${String(pileIndex).padStart(3, '0')}`;

          piles.push({
            id: pileId,
            building,
            axis: `${row}${col}`,
            section,
            status,
            positionX: colIdx * 10 + sectionIdx * 100,
            positionY: rowIdx * 10 + buildingIdx * 100,
            rigId: status !== Status.NOT_STARTED ? rigIds[Math.floor(Math.random() * rigIds.length)] : null,
            crewId: status !== Status.NOT_STARTED ? crewIds[Math.floor(Math.random() * crewIds.length)] : null,
            detail: generatePileDetail(status, pileId)
          });

          pileIndex++;
        });
      });
    });
  });

  return piles;
}

export const piles = generatePiles();
