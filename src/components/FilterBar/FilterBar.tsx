import { Search, Filter, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { PileStatus, PileStatusText } from '@/types';

const buildings = ['all', '1#楼', '2#楼', '3#楼'];
const sections = ['all', 'A区', 'B区', 'C区', 'D区'];

export default function FilterBar() {
  const { filters, setFilters, rigs } = useAppStore();

  const clearFilters = () => {
    setFilters({
      building: 'all',
      axis: '',
      section: 'all',
      status: 'all',
      rigId: 'all'
    });
  };

  const hasActiveFilters =
    filters.building !== 'all' ||
    filters.section !== 'all' ||
    filters.status !== 'all' ||
    filters.rigId !== 'all' ||
    filters.axis !== '';

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-slate-300">筛选条件</span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3 h-3" />
            清除筛选
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1">楼栋</label>
          <select
            value={filters.building}
            onChange={(e) => setFilters({ building: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          >
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b === 'all' ? '全部楼栋' : b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">区段</label>
          <select
            value={filters.section}
            onChange={(e) => setFilters({ section: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          >
            {sections.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? '全部区段' : s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">轴线</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={filters.axis}
              onChange={(e) => setFilters({ axis: e.target.value })}
              placeholder="如 A5、B3"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">状态</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value as PileStatus | 'all' })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          >
            <option value="all">全部状态</option>
            {Object.entries(PileStatusText).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">钻机</label>
          <select
            value={filters.rigId}
            onChange={(e) => setFilters({ rigId: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
          >
            <option value="all">全部钻机</option>
            {rigs.map((rig) => (
              <option key={rig.id} value={rig.id}>
                {rig.id} - {rig.model}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
