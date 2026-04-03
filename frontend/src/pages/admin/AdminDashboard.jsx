import { useState, useEffect } from 'react';
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reclamationService, departementService, userService } from '../../services/api';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminDepartements from './AdminDepartements';
import AdminReclamations from './AdminReclamations';
import AdminEmployees from './AdminEmployees';
import AdminReclamationDetails from './AdminReclamationDetails';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCurrentLanguage, getLocalizedText } from '../../utils/localization';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

function extractCollectionCount(payload) {
  if (Array.isArray(payload)) return payload.length;
  if (typeof payload?.total === 'number') return payload.total;
  if (Array.isArray(payload?.data)) return payload.data.length;
  return 0;
}

export default function AdminDashboard() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [stats, setStats] = useState({ users: 0, depts: 0, recs: 0, employees: 0 });
  const [loading, setLoading] = useState(true);
  const isDashboard = location.pathname === '/admin/dashboard';
  const language = getCurrentLanguage(i18n.language);

  const navItems = [
    { to: '/admin/users', label: getLocalizedText({ ar: 'المستخدمون', fr: 'Utilisateurs' }, language), icon: Users },
    { to: '/admin/departements', label: getLocalizedText({ ar: 'الأقسام', fr: 'Departements' }, language), icon: Building2 },
    { to: '/admin/employees', label: getLocalizedText({ ar: 'الموظفون', fr: 'Employes' }, language), icon: Briefcase },
    { to: '/admin/reclamations', label: getLocalizedText({ ar: 'الشكايات', fr: 'Reclamations' }, language), icon: FileText },
  ];

  const title = getLocalizedText({ ar: 'لوحة الإدارة', fr: "Panneau d'administration" }, language);

  useEffect(() => {
    Promise.all([userService.getAll(), departementService.getAll(), reclamationService.getAll()])
      .then(([u, d, r]) => {
        const users = Array.isArray(u.data) ? u.data : (u.data?.data || []);
        setStats({
          users: extractCollectionCount(u.data),
          employees: users.filter((x) => x.role === 'employe').length,
          depts: extractCollectionCount(d.data),
          recs: extractCollectionCount(r.data),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {!isDashboard && (
        <aside className="hidden md:flex w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
          <div className="p-8">
            <div className="flex items-center gap-3 px-2 mb-10">
              <div className="bg-blue-600 p-2 rounded-xl">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">{title}</span>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-100'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
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

      {!isDashboard && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center transition-all ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={18} />
              <span className="line-clamp-2 text-[10px] font-bold leading-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

      <main className="flex-1 px-3 py-4 pb-24 sm:px-4 md:p-10 md:pb-10">
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
                <Route path="reclamations/:id" element={<AdminReclamationDetails />} />
                <Route path="*" element={<Navigate to="/admin/users" replace />} />
              </Routes>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
