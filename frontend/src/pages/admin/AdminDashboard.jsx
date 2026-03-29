import { useState, useEffect } from 'react';
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { reclamationService, departementService, userService } from '../../services/api';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminDepartements from './AdminDepartements';
import AdminReclamations from './AdminReclamations';
import AdminEmployees from './AdminEmployees';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Users, 
  Building2, 
  Briefcase, 
  FileText, 
  LayoutDashboard, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { to: '/admin/users', label: 'Utilisateurs', icon: Users },
  { to: '/admin/departements', label: 'Départements', icon: Building2 },
  { to: '/admin/employees', label: 'Employés', icon: Briefcase },
  { to: '/admin/reclamations', label: 'Réclamations', icon: FileText },
];

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState({ users: 0, depts: 0, recs: 0, employees: 0 });
  const [loading, setLoading] = useState(true);
  const isDashboard = location.pathname === '/admin/dashboard';

  useEffect(() => {
    Promise.all([userService.getAll(), departementService.getAll(), reclamationService.getAll()])
      .then(([u, d, r]) => {
        const users = Array.isArray(u.data) ? u.data : (u.data?.data || []);
        setStats({
          users: u.data?.total || users.length,
          employees: users.filter(x => x.role === 'employe').length,
          depts: (d.data?.total || (Array.isArray(d.data?.data) ? d.data.data.length : 0)) || 0,
          recs:  (r.data?.total || (Array.isArray(r.data?.data) ? r.data.data.length : 0)) || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      {!isDashboard && (
      <aside className="hidden md:flex w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 px-2 mb-10">
            <div className="bg-blue-600 p-2 rounded-xl">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">panneau d'administration</span>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                    isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="transition-transform group-hover:scale-110" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            ))}
          </nav>
        </div>

      </aside>
      )}

      {/* Mobile Bottom Navigation */}
      {!isDashboard && (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Routes>
                <Route index element={<Navigate to="/admin/users" replace />} />
                <Route path="dashboard" element={<AdminOverview stats={stats} />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="departements" element={<AdminDepartements />} />
                <Route path="employees" element={<AdminEmployees />} />
                <Route path="reclamations" element={<AdminReclamations />} />
                <Route path="*" element={<Navigate to="/admin/users" replace />} />
              </Routes>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
