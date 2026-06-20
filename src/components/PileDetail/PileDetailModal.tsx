import { X, Clock, Ruler, Box, Users, User, MapPin, Drill } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime, formatDuration } from '@/utils/dateUtils';
import { PileStatusText, RigStatusText } from '@/types';
import { statusColors, riskLevelColors } from '@/utils/statusColors';
import { cn } from '@/lib/utils';

export default function PileDetailModal() {
  const { selectedPile, showPileDetail, setShowPileDetail, setSelectedPile, rigs, crews, risks, hasRisk } = useAppStore();

  const handleClose = () => {
    setShowPileDetail(false);
    setSelectedPile(null);
  };

  if (!showPileDetail || !selectedPile) return null;

  const rig = rigs.find((r) => r.id === selectedPile.rigId);
  const crew = crews.find((c) => c.id === selectedPile.crewId);
  const pileRisks = risks.filter((r) => r.pileId === selectedPile.id);
  const statusColor = statusColors[selectedPile.status];
  const pileHasRisk = hasRisk(selectedPile.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold',
                statusColor.bg,
                pileHasRisk && 'animate-pulse-risk ring-4 ring-red-500/50'
              )}
            >
              {selectedPile.axis}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedPile.id}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                    statusColor.bg,
                    'text-white'
                  )}
                >
                  {PileStatusText[selectedPile.status]}
                </span>
                {pileHasRisk && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                    存在风险
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <MapPin className="w-3 h-3" />
                位置信息
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-400">楼栋</span>
                  <span className="text-white font-medium">{selectedPile.building}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">区段</span>
                  <span className="text-white font-medium">{selectedPile.section}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">轴线</span>
                  <span className="text-white font-medium">{selectedPile.axis}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Drill className="w-3 h-3" />
                施工设备
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-400">钻机</span>
                  <span className="text-white font-medium">{rig?.id || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">机型</span>
                  <span className="text-white font-medium">{rig?.model || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">状态</span>
                  <span className={cn(
                    'font-medium',
                    rig?.status === 'running' ? 'text-emerald-400' :
                    rig?.status === 'maintenance' ? 'text-amber-400' : 'text-slate-400'
                  )}>
                    {rig ? RigStatusText[rig.status] : '-'}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Users className="w-3 h-3" />
                施工班组
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-400">班组</span>
                  <span className="text-white font-medium">{crew?.name || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">班组长</span>
                  <span className="text-white font-medium">{crew?.foreman || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">人数</span>
                  <span className="text-white font-medium">{crew?.memberCount || '-'} 人</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <User className="w-3 h-3" />
                责任人
              </div>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-slate-400">技术负责</span>
                  <span className="text-white font-medium">{selectedPile.detail?.designer || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">检测员</span>
                  <span className="text-white font-medium">{selectedPile.detail?.inspector || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-slate-400">机长</span>
                  <span className="text-white font-medium">{rig?.operator || '-'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
              <Clock className="w-3 h-3" />
              施工时间线
            </div>
            <div className="relative pl-6 border-l border-slate-700 space-y-4">
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-emerald-500" />
                <p className="text-xs text-slate-400">开钻时间</p>
                <p className="text-sm text-white font-medium">
                  {formatDateTime(selectedPile.detail?.drillStartTime)}
                </p>
              </div>
              {selectedPile.detail?.drillEndTime && (
                <div className="relative">
                  <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-blue-500" />
                  <p className="text-xs text-slate-400">终孔时间</p>
                  <p className="text-sm text-white font-medium">
                    {formatDateTime(selectedPile.detail.drillEndTime)}
                  </p>
                </div>
              )}
              {selectedPile.detail?.lastUpdateTime && (
                <div className="relative">
                  <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-slate-500" />
                  <p className="text-xs text-slate-400">最后更新</p>
                  <p className="text-sm text-white font-medium">
                    {formatDateTime(selectedPile.detail.lastUpdateTime)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Ruler className="w-3 h-3" />
                终孔深度
              </div>
              <p className="text-2xl font-bold text-white">
                {selectedPile.detail?.finalDepth || '-'}
                <span className="text-sm font-normal text-slate-400 ml-1">m</span>
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                <Box className="w-3 h-3" />
                混凝土方量
              </div>
              <p className="text-2xl font-bold text-white">
                {selectedPile.detail?.concreteVolume || '-'}
                <span className="text-sm font-normal text-slate-400 ml-1">m³</span>
              </p>
            </div>
          </div>

          {pileRisks.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-3">风险提示</h3>
              <div className="space-y-2">
                {pileRisks.map((risk) => (
                  <div key={risk.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        riskLevelColors[risk.level].bg
                      )}
                    />
                    <div>
                      <p className="text-sm text-white">{risk.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        已持续 {formatDuration(risk.durationHours)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
          >
            关闭
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
            查看历史记录
          </button>
        </div>
      </div>
    </div>
  );
}
