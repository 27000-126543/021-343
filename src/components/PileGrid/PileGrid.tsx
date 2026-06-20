import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getPileStatusBgClass } from '@/utils/statusColors';
import { PileStatusText } from '@/types';
import type { Pile } from '@/types';
import { ZoomIn, ZoomOut } from 'lucide-react';

export default function PileGrid() {
  const { getFilteredPiles, setSelectedPile, setShowPileDetail, hasRisk, filters } = useAppStore();
  const [zoom, setZoom] = useState(1);

  const filteredPiles = getFilteredPiles();

  const { gridCols, pilesByPosition } = useMemo(() => {
    const positions = new Map<string, Pile>();
    let maxX = 0;
    let maxY = 0;

    filteredPiles.forEach((pile) => {
      positions.set(`${pile.positionX}-${pile.positionY}`, pile);
      maxX = Math.max(maxX, pile.positionX);
      maxY = Math.max(maxY, pile.positionY);
    });

    return {
      gridCols: Math.ceil(maxX / 10) + 1,
      pilesByPosition: positions
    };
  }, [filteredPiles]);

  const handlePileClick = (pile: Pile) => {
    setSelectedPile(pile);
    setShowPileDetail(true);
  };

  const cellSize = 36 * zoom;

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
        <div
          className="grid gap-1 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
            width: 'fit-content'
          }}
        >
          {Array.from({ length: gridCols * 10 }).map((_, index) => {
            const x = (index % gridCols) * 10;
            const y = Math.floor(index / gridCols) * 10;
            const pile = pilesByPosition.get(`${x}-${y}`);

            if (!pile) {
              return <div key={index} className="opacity-0" style={{ width: cellSize, height: cellSize }} />;
            }

            const hasPileRisk = hasRisk(pile.id);
            const bgClass = getPileStatusBgClass(pile.status, hasPileRisk);

            return (
              <button
                key={pile.id}
                onClick={() => handlePileClick(pile)}
                className={`${bgClass} rounded-md flex items-center justify-center text-white font-medium transition-all duration-200 hover:scale-110 hover:shadow-lg hover:z-10 cursor-pointer border-2 border-white/10`}
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
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
        {Object.entries(PileStatusText).map(([status, label]) => (
          <div key={status} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded ${getPileStatusBgClass(status as any, false)}`}
            />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500 animate-pulse-risk" />
          <span className="text-xs text-slate-400">有风险</span>
        </div>
      </div>
    </div>
  );
}
