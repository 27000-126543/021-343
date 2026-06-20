import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, AlertTriangle, User, Calendar } from 'lucide-react';

const navItems = [
  { path: '/', label: '进度看板', icon: LayoutDashboard },
  { path: '/daily', label: '日报汇总', icon: FileText },
  { path: '/risks', label: '风险提醒', icon: AlertTriangle }
];

export default function AppLayout() {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-lg">桩</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                  桩基施工进度看板
                </h1>
                <p className="text-xs text-slate-400">Pile Construction Progress Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{today}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium">项目经理</span>
            </div>
          </div>
        </div>

        <nav className="mt-4 flex gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-3">
        <p className="text-xs text-slate-500 text-center">
          © 2025 桩基施工进度管理系统 | 数据每5分钟自动刷新
        </p>
      </footer>
    </div>
  );
}
