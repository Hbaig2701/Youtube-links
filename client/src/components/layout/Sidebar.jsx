import { NavLink } from 'react-router-dom';
import { BarChart3, Link2, LayoutDashboard, Globe, Settings } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manage', label: 'Manage Links', icon: Link2 },
  { to: '/domains', label: 'Domains', icon: Globe },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-indigo-600" size={24} />
          <h1 className="text-lg font-bold text-gray-900">LinkTracker</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">YouTube Link Analytics</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
