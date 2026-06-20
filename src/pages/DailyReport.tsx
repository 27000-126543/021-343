import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Calendar, Gauge, ArrowUpDown, AlertCircle, BarChart3, PieChart, MapPin, Target, TrendingUp, TrendingDown } from 'lucide-react';
import StatCard from '@/components/StatCard/StatCard';
import { useAppStore } from '@/store/useAppStore';
import { getTodayString } from '@/utils/dateUtils';
import { RigStatusText } from '@/types';
import { cn } from '@/lib/utils';

const sectionOptions = ['all', 'A区', 'B区', 'C区', 'D区'];

export default function DailyReport() {
  const {
    selectedDate, setSelectedDate, getDailyStats, getTrendData, getRigRanking,
    getAbnormalReasons, getPlanComparison, rigs, filters, setFilters,
    dailySectionFilter, setDailySectionFilter
  } = useAppStore();
  const [trendDays, setTrendDays] = useState<7 | 30>(7);

  const section = dailySectionFilter;
  const dailyStats = getDailyStats(selectedDate, section);
  const trendData = getTrendData(trendDays, section, selectedDate);
  const rigRanking = getRigRanking(selectedDate, section);
  const abnormalReasons = getAbnormalReasons(selectedDate, section);
  const planComparison = getPlanComparison(selectedDate, section);

  const filteredRanking = useMemo(() => {
    if (filters.rigId === 'all') return rigRanking;
    return rigRanking.filter((r) => r.rig.id === filters.rigId);
  }, [rigRanking, filters.rigId]);

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(51, 65, 85, 0.5)',
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      data: ['完成根数', '当日延米', '累计延米'],
      textStyle: { color: '#94a3b8' },
      top: 0
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: trendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: [
      { type: 'value', name: '根数', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: 'rgba(51, 65, 85, 0.3)' } } },
      { type: 'value', name: '延米', axisLine: { lineStyle: { color: '#334155' } }, axisLabel: { color: '#94a3b8' }, splitLine: { show: false } }
    ],
    series: [
      { name: '完成根数', type: 'bar', data: trendData.map((d) => d.completed), itemStyle: { color: '#3B82F6', borderRadius: [4, 4, 0, 0] } },
      { name: '当日延米', type: 'line', yAxisIndex: 1, data: trendData.map((d) => d.dailyMeters), itemStyle: { color: '#F59E0B' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: 6 },
      { name: '累计延米', type: 'line', yAxisIndex: 1, data: trendData.map((d) => d.cumulativeMeters), itemStyle: { color: '#10B981' }, lineStyle: { width: 3 }, symbol: 'circle', symbolSize: 8, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.25)' }, { offset: 1, color: 'rgba(16, 185, 129, 0.02)' }] } } }
    ]
  };

  const pieOption = {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(30, 41, 59, 0.95)', borderColor: 'rgba(51, 65, 85, 0.5)', textStyle: { color: '#e2e8f0' }, formatter: '{b}: {c}次 ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center', textStyle: { color: '#94a3b8', fontSize: 12 } },
    series: [{ type: 'pie', radius: ['40%', '70%'], center: ['35%', '50%'], avoidLabelOverlap: false, itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 }, label: { show: false }, emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' } }, data: abnormalReasons.map((r, i) => ({ value: r.count, name: r.reason, itemStyle: { color: ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899'][i % 6] } })) }]
  };

  const today = getTodayString();
  const dateOptions = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dateOptions.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">日报汇总</h1>
          <p className="text-sm text-slate-400 mt-1">每日产能统计与机组分析 · 截止 {selectedDate}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              {dateOptions.map((d) => (<option key={d} value={d}>{d === today ? '今日' : d}</option>))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select value={dailySectionFilter} onChange={(e) => setDailySectionFilter(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              {sectionOptions.map((s) => (<option key={s} value={s}>{s === 'all' ? '全部区段' : s}</option>))}
            </select>
          </div>
          <select value={filters.rigId} onChange={(e) => setFilters({ rigId: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            <option value="all">全部钻机</option>
            {rigs.map((r) => (<option key={r.id} value={r.id}>{r.id}</option>))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="当日完成" value={dailyStats.totalCompleted} unit="根" icon={BarChart3} color="blue" trend={12.5} trendLabel="较昨日" />
        <StatCard title="当日延米" value={dailyStats.dailyMeters} unit="m" icon={Gauge} color="amber" trend={8.3} trendLabel="较昨日" />
        <StatCard title="累计延米" value={dailyStats.cumulativeMeters} unit="m" icon={ArrowUpDown} color="green" />
        <StatCard title="机组平均产能" value={dailyStats.avgRigProductivity} unit="根/台" icon={BarChart3} color="violet" />
        <StatCard title="异常记录" value={dailyStats.abnormalCount} unit="次" icon={AlertCircle} color="red" trend={-15} trendLabel="较上周" />
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">计划对比视图</h2>
          {section !== 'all' && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{section}</span>}
          <span className="text-xs text-slate-500">{selectedDate}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">区段</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">计划(根)</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">实际(根)</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">偏差</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">完成率</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">进度条</th>
              </tr>
            </thead>
            <tbody>
              {planComparison.map((row) => (
                <tr key={row.section} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-white">{row.section}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-sm text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.planned}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-mono text-sm font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.actual}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={cn('font-mono text-sm font-medium flex items-center justify-end gap-1', row.deviation >= 0 ? 'text-emerald-400' : 'text-red-400')} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.deviation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {row.deviation > 0 ? '+' : ''}{row.deviation}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={cn('font-mono text-sm font-bold', row.completionRate >= 100 ? 'text-emerald-400' : row.completionRate >= 80 ? 'text-amber-400' : 'text-red-400')} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {row.completionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                      <div
                        className={cn('h-2.5 rounded-full transition-all', row.completionRate >= 100 ? 'bg-emerald-500' : row.completionRate >= 80 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${Math.min(row.completionRate, 100)}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">产能趋势</h2>
              {section !== 'all' && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{section}</span>}
            </div>
            <div className="flex bg-slate-800 rounded-lg p-1">
              <button onClick={() => setTrendDays(7)} className={cn('px-3 py-1 text-xs rounded-md transition-colors', trendDays === 7 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>近7天</button>
              <button onClick={() => setTrendDays(30)} className={cn('px-3 py-1 text-xs rounded-md transition-colors', trendDays === 30 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}>近30天</button>
            </div>
          </div>
          <ReactECharts option={trendOption} style={{ height: '300px' }} theme="dark" />
        </div>
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">异常原因分布</h2>
            <span className="text-xs text-slate-500">近7天</span>
          </div>
          {abnormalReasons.length > 0 ? <ReactECharts option={pieOption} style={{ height: '300px' }} theme="dark" /> : <div className="h-[300px] flex items-center justify-center text-slate-500">暂无异常记录</div>}
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">机组产能排名</h2>
          {section !== 'all' && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{section}</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">排名</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">钻机编号</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">机型</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">机长</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">完成根数</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">当日延米</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">停工时长</th>
              </tr>
            </thead>
            <tbody>
              {filteredRanking.map((row, index) => (
                <tr key={row.rig.id} className={cn('border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors', index === 0 && 'bg-amber-500/5')}>
                  <td className="py-3 px-4"><span className={cn('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold', index === 0 ? 'bg-amber-500 text-slate-900' : index === 1 ? 'bg-slate-400 text-slate-900' : index === 2 ? 'bg-amber-700 text-slate-100' : 'bg-slate-700 text-slate-400')}>{index + 1}</span></td>
                  <td className="py-3 px-4"><span className="font-mono text-sm text-white">{row.rig.id}</span></td>
                  <td className="py-3 px-4 text-sm text-slate-300">{row.rig.model}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{row.rig.operator}</td>
                  <td className="py-3 px-4"><span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', row.rig.status === 'running' ? 'bg-emerald-500/20 text-emerald-400' : row.rig.status === 'maintenance' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-600/20 text-slate-400')}><span className={cn('w-1.5 h-1.5 rounded-full', row.rig.status === 'running' ? 'bg-emerald-400 animate-pulse' : row.rig.status === 'maintenance' ? 'bg-amber-400' : 'bg-slate-400')} />{RigStatusText[row.rig.status]}</span></td>
                  <td className="py-3 px-4 text-right"><span className="font-mono text-sm font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.completed}</span></td>
                  <td className="py-3 px-4 text-right"><span className="font-mono text-sm text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.meters}</span></td>
                  <td className="py-3 px-4 text-right"><span className={cn('font-mono text-sm', row.downtime > 0 ? 'text-red-400' : 'text-slate-500')} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.downtime > 0 ? `${row.downtime}h` : '-'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
