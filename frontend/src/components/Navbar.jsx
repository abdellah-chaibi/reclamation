import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLinks = {
  citoyen: [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/about', label: 'About', icon: 'ℹ️' },
    { to: '/reclamations', label: 'Reclamations', icon: '📋' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ],
  employe: [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/about', label: 'About', icon: 'ℹ️' },
    { to: '/employee', label: 'My Tasks', icon: '🔧' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ],
  chef_dep: [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/about', label: 'About', icon: 'ℹ️' },
    { to: '/chef', label: 'Dashboard', icon: '📊' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ],
  admin: [
    { to: '/home', label: 'Home', icon: '🏠' },
    { to: '/about', label: 'About', icon: 'ℹ️' },
    { to: '/admin', label: 'Admin', icon: '⚙️' },
    { to: '/profile', label: 'Profile', icon: '👤' },
  ],
};

const roleBadgeLabel = { admin: 'Admin', chef_dep: 'Chef Service', employe: 'Employee', citoyen: 'Citoyen' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = roleLinks[user?.role] || roleLinks.citoyen;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/home" className="navbar-logo">
          <span className="logo-icon">🏛️</span>
          <span>ReclamApp</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* User info + logout */}
        <div className="navbar-user">
          <span className={`badge badge-role-${user?.role}`}>
            {roleBadgeLabel[user?.role] || user?.role}
          </span>
          <span className="navbar-username">{user?.name}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="divider" />
          <div className="mobile-user-info">
            <span className={`badge badge-role-${user?.role}`}>{roleBadgeLabel[user?.role]}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.name}</span>
          </div>
          <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={handleLogout}>Sign out</button>
        </div>
      )}
    </nav>
  );
}
