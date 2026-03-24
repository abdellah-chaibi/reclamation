import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const roleInfo = {
  admin:    { label: 'Administrator', icon: '⚙️', color: 'var(--primary)', desc: 'Full system access', link: '/admin', linkLabel: 'Admin Dashboard' },
  chef_dep: { label: 'Chef Service',  icon: '📊', color: 'var(--secondary)', desc: 'Manage department reclamations', link: '/chef', linkLabel: 'Chef Dashboard' },
  employe:  { label: 'Employee',      icon: '🔧', color: 'var(--info)', desc: 'Handle assigned reclamations', link: '/employee', linkLabel: 'My Tasks' },
  citoyen:  { label: 'Citizen',       icon: '👤', color: 'var(--success)', desc: 'Submit and track your reclamations', link: '/reclamations', linkLabel: 'My Reclamations' },
};

export default function Home() {
  const { user } = useAuth();
  const info = roleInfo[user?.role] || roleInfo.citoyen;

  return (
    <div className="page-wrapper fade-up">
      {/* Greeting */}
      <div className="section-header">
        <h2 className="section-title">👋 Welcome, {user?.name}!</h2>
        <span className={`badge badge-role-${user?.role}`}>{info.label}</span>
      </div>

      {/* Role Card */}
      <div className="card" style={{ marginBottom: '2rem', borderColor: `${info.color}3a`, background: `linear-gradient(135deg, var(--bg-card) 0%, ${info.color}0a 100%)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div className="stat-icon stat-icon-primary" style={{ fontSize: '2rem', width: 64, height: 64 }}>{info.icon}</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Your Role: {info.label}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{info.desc}</p>
          </div>
          <Link to={info.link} className="btn btn-primary">{info.linkLabel} →</Link>
        </div>
      </div>

      {/* Platform info cards */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Platform Overview</h3>
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">📋</div>
          <div>
            <div className="stat-number" style={{ fontSize: '1.5rem' }}>Fast</div>
            <div className="stat-label">Reclamation Processing</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">🏢</div>
          <div>
            <div className="stat-number" style={{ fontSize: '1.5rem' }}>Multi</div>
            <div className="stat-label">Department Support</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">🔔</div>
          <div>
            <div className="stat-number" style={{ fontSize: '1.5rem' }}>Live</div>
            <div className="stat-label">Status Tracking</div>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Links</h3>
      <div className="grid-2">
        <Link to={info.link} className="card card-sm" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', cursor: 'pointer', textDecoration: 'none', color: 'var(--text)' }}>
          <span style={{ fontSize: '1.5rem' }}>{info.icon}</span>
          <div>
            <div style={{ fontWeight: 600 }}>{info.linkLabel}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Go to your workspace</div>
          </div>
        </Link>
        <Link to="/profile" className="card card-sm" style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', cursor: 'pointer', textDecoration: 'none', color: 'var(--text)' }}>
          <span style={{ fontSize: '1.5rem' }}>👤</span>
          <div>
            <div style={{ fontWeight: 600 }}>Profile</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View your account details</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
