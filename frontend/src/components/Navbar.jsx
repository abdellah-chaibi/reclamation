import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import {
  Home as HomeIcon,
  Info,
  ClipboardList,
  User,
  Settings,
  BarChart3,
  Wrench,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  LayoutDashboard,
} from 'lucide-react';
import logo from './../assets/Logo.png';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const roleLinks = {
    citoyen: [
      { to: '/home', label: t('navbar.home'), icon: HomeIcon },
      { to: '/reclamations', label: t('navbar.complaints'), icon: ClipboardList },
      { to: '/about', label: t('navbar.about'), icon: Info },
      { to: '/profile', label: t('navbar.profile'), icon: User },
    ],
    employe: [
      { to: '/employee', label: t('navbar.tasks'), icon: Wrench },
      { to: '/profile', label: t('navbar.profile'), icon: User },
    ],
    chef_dep: [
      { to: '/chef', label: t('navbar.dashboard'), icon: BarChart3 },
      { to: '/chef/employees', label: t('navbar.employees'), icon: Users },
      { to: '/profile', label: t('navbar.profile'), icon: User },
    ],
    admin: [
      { to: '/admin/dashboard', label: t('navbar.dashboard'), icon: LayoutDashboard },
      { to: '/admin', label: t('navbar.administration'), icon: Settings },
      { to: '/profile', label: t('navbar.profile'), icon: User },
    ],
  };

  const roleBadgeStyles = {
    admin: 'bg-blue-50 text-blue-700 border-blue-100',
    chef_dep: 'bg-purple-50 text-purple-700 border-purple-100',
    employe: 'bg-amber-50 text-amber-700 border-amber-100',
    citoyen: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const roleBadgeLabel = {
    admin: t('roles.admin'),
    chef_dep: t('roles.chef_dep'),
    employe: t('roles.employe'),
    citoyen: t('roles.citoyen'),
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  const links = roleLinks[user?.role] || roleLinks.citoyen;

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const isActive = (to) => {
    if (to === '/admin') {
      return location.pathname === '/admin' || (location.pathname.startsWith('/admin/') && !location.pathname.startsWith('/admin/dashboard'));
    }
    if (to === '/chef') return location.pathname === '/chef';
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-2' : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/home" className="flex items-center gap-2 group shrink-0">
              <div className="p-1 rounded-xl group-hover:scale-105 transition-transform">
                <img src={logo} className="h-10 w-auto" alt="logo" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">{t('common.siteName')}</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      active ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-slate-200">
              <LanguageSwitcher compact />
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border mt-1.5 ${roleBadgeStyles[user?.role] || roleBadgeStyles.citoyen}`}>
                  {roleBadgeLabel[user?.role] || t('roles.user')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                title={t('navbar.logout')}
              >
                <LogOut size={20} />
              </button>
            </div>

            <button
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={t('navbar.toggleMenu')}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <div className="h-[88px] lg:h-[96px] w-full" aria-hidden="true" />

      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1001] transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[1002] p-6 transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="flex items-center gap-2 text-lg font-black text-slate-900 whitespace-nowrap">
            <img src={logo} className="h-10 w-auto" alt="logo" />
            <span>{t('navbar.mobileTitle')}</span>
          </span>
          <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                  active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  {link.label}
                </div>
                <ChevronRight size={16} className={active ? 'opacity-100' : 'opacity-30'} />
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 shrink-0">
          <div className="mb-4">
            <LanguageSwitcher className="w-full justify-between" />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 truncate">{user?.name || t('roles.invited')}</span>
              <span className="text-xs text-slate-500 mt-1">{roleBadgeLabel[user?.role] || t('roles.user')}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            {t('navbar.logout')}
          </button>
        </div>
      </div>
    </>
  );
}
