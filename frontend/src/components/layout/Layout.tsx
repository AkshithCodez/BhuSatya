import { Outlet, NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: '📊' },
  { to: '/app/upload', label: 'Upload', icon: '📤' },
  { to: '/app/review-queue', label: 'Review Queue', icon: '📋' },
  { to: '/app/parcels', label: 'Land Records', icon: '🗺️' },
  { to: '/app/audit', label: 'Audit Trail', icon: '📝' },
];

export default function Layout() {
  const navigate = useNavigate();
  const name = localStorage.getItem('userName') || 'Officer';
  const role = localStorage.getItem('userRole') || '';

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-xl font-bold tracking-tight">🏛️ BhuSatya</h1>
          <p className="text-xs text-slate-400 mt-1">Land Record Verification</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white border-r-3 border-blue-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-xs text-slate-400">{role.replace(/_/g, ' ')}</p>
          <button
            onClick={logout}
            className="mt-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
