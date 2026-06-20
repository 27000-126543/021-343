import { useState } from 'react';
import { AlertTriangle, Clock, MapPin, ArrowRight, CheckCircle2, UserCheck, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { Risk, RiskResolution } from '@/types';
import { RiskTypeText, RiskLevelText, RiskStatus } from '@/types';
import { riskLevelColors, riskTypeColors } from '@/utils/statusColors';
import { formatDuration, formatDateTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface RiskCardProps {
  risk: Risk;
  onLocate: (pileId: string) => void;
  isPinned?: boolean;
  onResolve?: (riskId: string, resolution: RiskResolution, newStatus: RiskStatus) => void;
}

export default function RiskCard({ risk, onLocate, isPinned, onResolve }: RiskCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [opinion, setOpinion] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  const levelColor = riskLevelColors[risk.level];
  const typeColor = riskTypeColors[risk.type];

  const handleSubmit = () => {
    if (!opinion.trim() || !assignee.trim() || !dueDate) return;
    const resolution: RiskResolution = { opinion: opinion.trim(), assignee: assignee.trim(), dueDate };
    const newStatus = risk.status === RiskStatus.PENDING ? RiskStatus.PROCESSING : RiskStatus.RESOLVED;
    onResolve?.(risk.id, resolution, newStatus);
    setShowForm(false);
    setOpinion('');
    setAssignee('');
    setDueDate('');
  };

  const handleResolve = () => {
    if (!opinion.trim()) return;
    const resolution: RiskResolution = {
      opinion: opinion.trim(),
      assignee: risk.resolution?.assignee || assignee.trim() || '-',
      dueDate: risk.resolution?.dueDate || dueDate || new Date().toISOString().split('T')[0],
      resolvedAt: new Date().toISOString()
    };
    onResolve?.(risk.id, resolution, RiskStatus.RESOLVED);
    setShowForm(false);
    setOpinion('');
    setAssignee('');
    setDueDate('');
  };

  const statusLabel = risk.status === RiskStatus.RESOLVED ? '已解决' : risk.status === RiskStatus.PROCESSING ? '处理中' : '待处理';

  return (
    <div
      className={cn(
        'relative bg-slate-900 border rounded-xl p-5 transition-all duration-300 hover:shadow-xl',
        isPinned
          ? 'border-red-500/50 shadow-lg shadow-red-500/10'
          : 'border-slate-800 hover:border-slate-700'
      )}
    >
      {isPinned && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-xs font-medium rounded-br-xl rounded-tl-xl">
          置顶
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isPinned ? 'bg-red-500/20 animate-pulse-slow' : `${levelColor.bg}/20`
            )}
          >
            <AlertTriangle
              className={cn(
                'w-5 h-5',
                isPinned ? 'text-red-400' : levelColor.text
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  typeColor.bg,
                  typeColor.text
                )}
              >
                {RiskTypeText[risk.type]}
              </span>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  levelColor.bg,
                  'text-white'
                )}
              >
                {RiskLevelText[risk.level]}风险
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{risk.id}</p>
          </div>
        </div>

        <span
          className={cn(
            'text-xs px-2 py-1 rounded',
            risk.status === RiskStatus.RESOLVED
              ? 'bg-emerald-500/20 text-emerald-400'
              : risk.status === RiskStatus.PROCESSING
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-700 text-slate-400'
          )}
        >
          {statusLabel}
        </span>
      </div>

      <p className="text-sm text-slate-200 mb-4">{risk.description}</p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <MapPin className="w-3 h-3" />
            关联桩号
          </div>
          <p className="text-sm font-medium text-white">{risk.pileId}</p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            持续时长
          </div>
          <p className={cn('text-sm font-medium', levelColor.text)}>
            {formatDuration(risk.durationHours)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            发现时间
          </div>
          <p className="text-sm text-slate-300">{formatDateTime(risk.createdAt).split(' ')[0]}</p>
        </div>
      </div>

      {risk.resolution && (
        <div className={cn(
          'rounded-lg p-3 mb-4 border',
          risk.status === RiskStatus.RESOLVED
            ? 'bg-emerald-500/10 border-emerald-500/20'
            : 'bg-amber-500/10 border-amber-500/20'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {risk.status === RiskStatus.RESOLVED ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <UserCheck className="w-4 h-4 text-amber-400" />
            )}
            <span className={cn('text-xs font-medium', risk.status === RiskStatus.RESOLVED ? 'text-emerald-400' : 'text-amber-400')}>
              {risk.status === RiskStatus.RESOLVED ? '已闭环' : '处理中'}
            </span>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-300">{risk.resolution.opinion}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-400">负责人: <span className="text-slate-200">{risk.resolution.assignee}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-slate-400">预计完成: <span className="text-slate-200">{risk.resolution.dueDate}</span></span>
            </div>
            {risk.resolution.resolvedAt && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-400">实际完成: {formatDateTime(risk.resolution.resolvedAt).split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {risk.status !== RiskStatus.RESOLVED && onResolve && (
        <div className="mb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            {showForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showForm ? '收起处理表单' : risk.status === RiskStatus.PROCESSING ? '标记已解决' : '开始处理'}
          </button>

          {showForm && (
            <div className="mt-2 space-y-3 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div>
                <label className="block text-xs text-slate-400 mb-1">处理意见 *</label>
                <textarea
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  placeholder="请输入处理措施..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                />
              </div>
              {risk.status === RiskStatus.PENDING && (
                <>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">负责人 *</label>
                    <input
                      type="text"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                      placeholder="请输入负责人姓名"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">预计完成时间 *</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!opinion.trim() || !assignee.trim() || !dueDate}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    确认开始处理
                  </button>
                </>
              )}
              {risk.status === RiskStatus.PROCESSING && (
                <button
                  onClick={handleResolve}
                  disabled={!opinion.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm font-medium transition-colors"
                >
                  确认已解决
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => onLocate(risk.pileId)}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors group"
      >
        定位到桩位
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
