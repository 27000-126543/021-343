import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getPileStatusBgClass } from '@/utils/statusColors';
import { PileStatusText } from '@/types';
import type { Pile } from '@/types';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PileGrid() {
  const { getFilteredPiles, setSelectedPile, setShowPileDetail, hasRisk, filters, highlightedPileId } = useAppStore();
  const [zoom, setZoom] = useState(1);

  const filteredPiles = getFilteredPiles();

  const buildingGroups = useMemo(() => {
    const groups = new Map<string, Pile[]>();
    filteredPiles.forEach((pile) => {
      const list = groups.get(pile.building) || [];
      list.push(pile);
      groups.set(pile.building, list);
    });
    return groups;
  }, [filteredPiles]);

  const handlePileClick = (pile: Pile) => {
    setSelectedPile(pile);
    setShowPileDetail(true);
  };

  const cellSize = 36 * zoom;

  const renderBuildingGrid = (building: string, piles: Pile[]) => {
    const sectionGroups = new Map<string, Pile[]>();
    piles.forEach((p) => {
      const list = sectionGroups.get(p.section) || [];
      list.push(p);
      sectionGroups.set(p.section, list);
    });

    const sectionEntries = Array.from(sectionGroups.entries()).sort(([a], [b]) => a.localeCompare(b));

    return (
      <div key={building} className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-base font-semibold text-white">{building}</h3>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{piles.length} 根</span>
        </div>

        <div className="space-y-4">
          {sectionEntries.map(([section, sectionPiles]) => {
            const cols = 10;
            const rowMap = new Map<number, Map<number, Pile>>();
            let maxRow = 0;

            sectionPiles.forEach((p) => {
              if (!rowMap.has(p.row)) rowMap.set(p.row, new Map());
              rowMap.get(p.row)!.set(p.col, p);
              maxRow = Math.max(maxRow, p.row);
            });

            const rows = Array.from({ length: maxRow + 1 }, (_, i) => i);

            return (
              <div key={section} className="bg-slate-800/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-slate-300">{section}</span>
                  <span className="text-xs text-slate-500">{sectionPiles.length} 根</span>
                </div>
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                    width: 'fit-content'
                  }}
                >
                  {rows.flatMap((rowIdx) =>
                    Array.from({ length: cols }, (_, colIdx) => {
                      const pile = rowMap.get(rowIdx)?.get(colIdx);
                      if (!pile) {
                        return (
                          <div
                            key={`${rowIdx}-${colIdx}`}
                            className="rounded-md bg-slate-800/30"
                            style={{ width: cellSize, height: cellSize }}
                          />
                        );
                      }

                      const hasPileRisk = hasRisk(pile.id);
                      const isHighlighted = highlightedPileId === pile.id;
                      const bgClass = getPileStatusBgClass(pile.status, hasPileRisk);

                      return (
                        <button
                          key={pile.id}
                          onClick={() => handlePileClick(pile)}
                          className={cn(
                            bgClass,
                            'rounded-md flex items-center justify-center text-white font-medium transition-all duration-200 hover:scale-110 hover:shadow-lg hover:z-10 cursor-pointer border-2',
                            isHighlighted
                              ? 'border-yellow-400 ring-2 ring-yellow-400/60 z-20 scale-110 shadow-lg shadow-yellow-400/30'
                              : 'border-white/10'
                          )}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            fontSize: `${Math.max(8, 10 * zoom)}px`
                          }}
                          title={`${pile.id} - ${PileStatusText[pile.status]}`}
                        >
                          <span className="truncate px-0.5">{pile.axis}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">桩位状态图</h2>
          <p className="text-xs text-slate-400 mt-1">
            共 {filteredPiles.length} 根桩
            {filters.building !== 'all' && ` · ${filters.building}`}
            {filters.section !== 'all' && ` · ${filters.section}`}
            {filters.status !== 'all' && ` · ${PileStatusText[filters.status]}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-[600px] rounded-lg border border-slate-700/50 p-4">
        {Array.from(buildingGroups.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([building, piles]) => renderBuildingGrid(building, piles))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {Object.entries(PileStatusText).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded ${getPileStatusBgClass(status as any, false)}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500 animate-pulse-risk" />
          <span className="text-xs text-slate-400">有风险</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500 border-2 border-yellow-400" />
          <span className="text-xs text-slate-400">定位高亮</span>
        </div>
      </div>
    </div>
  );
}
