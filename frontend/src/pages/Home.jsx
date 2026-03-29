import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  BarChart3,
  Wrench,
  User as UserIcon,
  ArrowRight,
  ClipboardCheck,
  Building2,
  BellRing,
  LayoutDashboard,
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const roleInfo = {
    admin: {
      label: t('home.roleInfo.admin.label'),
      icon: Settings,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      desc: t('home.roleInfo.admin.desc'),
      link: '/admin',
      linkLabel: t('home.roleInfo.admin.linkLabel'),
    },
    chef_dep: {
      label: t('home.roleInfo.chef_dep.label'),
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      desc: t('home.roleInfo.chef_dep.desc'),
      link: '/chef',
      linkLabel: t('home.roleInfo.chef_dep.linkLabel'),
    },
    employe: {
      label: t('home.roleInfo.employe.label'),
      icon: Wrench,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      desc: t('home.roleInfo.employe.desc'),
      link: '/employee',
      linkLabel: t('home.roleInfo.employe.linkLabel'),
    },
    citoyen: {
      label: t('home.roleInfo.citoyen.label'),
      icon: UserIcon,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      desc: t('home.roleInfo.citoyen.desc'),
      link: '/reclamations',
      linkLabel: t('home.roleInfo.citoyen.linkLabel'),
    },
  };

  const info = roleInfo[user?.role] || roleInfo.citoyen;
  const Icon = info.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('home.hello', { name: user?.name || t('home.fallbackName') })}
          </h2>
          <p className="text-slate-500 font-medium mt-1">{t('home.subtitle')}</p>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-3xl border ${info.border} ${info.bg} p-8 mb-12 shadow-sm transition-all hover:shadow-md`}>
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm ${info.color}`}>
            <Icon size={40} />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('home.roleSpace', { role: info.label })}</h3>
            <p className="text-slate-600 max-w-xl">{info.desc}</p>
          </div>
          <Link to={info.link} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:translate-x-1 shadow-lg shadow-slate-900/10">
            {info.linkLabel} <ArrowRight size={18} />
          </Link>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">{t('home.overview')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={ClipboardCheck} title={t('home.stats.fastTitle')} desc={t('home.stats.fastDesc')} color="text-blue-500" bg="bg-blue-50" />
          <StatCard icon={Building2} title={t('home.stats.multiTitle')} desc={t('home.stats.multiDesc')} color="text-emerald-500" bg="bg-emerald-50" />
          <StatCard icon={BellRing} title={t('home.stats.liveTitle')} desc={t('home.stats.liveDesc')} color="text-amber-500" bg="bg-amber-50" />
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">{t('home.quickLinks')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickLink to={info.link} icon={LayoutDashboard} title={info.linkLabel} subtitle={t('home.workspaceSubtitle')} />
          <QuickLink to="/profile" icon={UserIcon} title={t('home.profileTitle')} subtitle={t('home.profileSubtitle')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, desc, color, bg }) {
  return (
    <div className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center gap-5 shadow-sm transition-hover hover:border-slate-200">
      <div className={`p-4 rounded-xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-xl font-extrabold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500 font-medium">{desc}</div>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, title, subtitle }) {
  return (
    <Link to={to} className="group bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 transition-all hover:bg-slate-50 hover:border-slate-300">
      <div className="p-3 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-colors">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-slate-900 leading-tight">{title}</div>
        <div className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</div>
      </div>
      <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
