import { useState, useEffect } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { reclamationService, departementService, userService } from '../../services/api';
import AdminUsers from './AdminUsers';
import AdminDepartements from './AdminDepartements';
import AdminReclamations from './AdminReclamations';
import AdminEmployees from './AdminEmployees';
import LoadingSpinner from '../../components/LoadingSpinner';

function AdminOverview({ stats }) {
  return (
    <div className="fade-up">
      <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>⚙️ Admin Overview</h2>
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">👥</div>
          <div><div className="stat-number">{stats.users}</div><div className="stat-label">Total Users</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">🏢</div>
          <div><div className="stat-number">{stats.depts}</div><div className="stat-label">Departments</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">📋</div>
          <div><div className="stat-number">{stats.recs}</div><div className="stat-label">Reclamations</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">🔧</div>
          <div><div className="stat-number">{stats.employees}</div><div className="stat-label">Employees</div></div>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
        <p>Use the sidebar to manage each section of the platform.</p>
      </div>
    </div>
  );
}

const navItems = [
  { to: '/admin', label: 'Overview',     icon: '📊', end: true },
  { to: '/admin/users', label: 'Users',  icon: '👥' },
  { to: '/admin/departements', label: 'Departments', icon: '🏢' },
  { to: '/admin/employees', label: 'Employees', icon: '🔧' },
  { to: '/admin/reclamations', label: 'Reclamations', icon: '📋' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, depts: 0, recs: 0, employees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userService.getAll(), departementService.getAll(), reclamationService.getAll()])
      .then(([u, d, r]) => {
        const users = u.data || [];
        setStats({
          users: Array.isArray(users) ? users.length : (users.total || 0),
          employees: Array.isArray(users) ? users.filter(x => x.role === 'employe').length : 0,
          depts: (d.data?.total || (Array.isArray(d.data?.data) ? d.data.data.length : 0)) || 0,
          recs:  (r.data?.total || (Array.isArray(r.data?.data) ? r.data.data.length : 0)) || 0,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - var(--navbar-h))' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <span>⚙️</span> Admin Panel
        </div>
        <nav className="admin-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <span>{item.icon}</span> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="admin-content">
        {loading ? <LoadingSpinner /> : (
          <Routes>
            <Route index element={<AdminOverview stats={stats} />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="departements" element={<AdminDepartements />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="reclamations" element={<AdminReclamations />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}
