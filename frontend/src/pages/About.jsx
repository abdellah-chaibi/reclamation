import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Building2,
  RefreshCw,
  Users,
  ShieldCheck,
  MapPin,
  User as UserIcon,
  Wrench,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const features = [
    { icon: ClipboardCheck, title: t('about.features.submitTitle'), desc: t('about.features.submitDesc'), color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Building2, title: t('about.features.routeTitle'), desc: t('about.features.routeDesc'), color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: RefreshCw, title: t('about.features.trackTitle'), desc: t('about.features.trackDesc'), color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Users, title: t('about.features.teamTitle'), desc: t('about.features.teamDesc'), color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: ShieldCheck, title: t('about.features.secureTitle'), desc: t('about.features.secureDesc'), color: 'text-red-600', bg: 'bg-red-50' },
    { icon: MapPin, title: t('about.features.geoTitle'), desc: t('about.features.geoDesc'), color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const roles = [
    { label: t('roles.citoyen'), icon: UserIcon, badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100', desc: t('about.roles.citoyen') },
    { label: t('roles.employe'), icon: Wrench, badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100', desc: t('about.roles.employe') },
    { label: t('roles.chef_dep'), icon: BarChart3, badgeStyle: 'bg-purple-50 text-purple-700 border-purple-100', desc: t('about.roles.chef_dep') },
    { label: t('roles.admin'), icon: Settings, badgeStyle: 'bg-blue-50 text-blue-700 border-blue-100', desc: t('about.roles.admin') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-16 mb-16 text-center shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">{t('about.title')}</h1>
          <p className="text-slate-300 text-lg leading-relaxed font-medium">{t('about.description')}</p>
        </div>
      </div>

      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">{t('about.services')}</h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="group p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <f.icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">{t('about.actors')}</h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((r, i) => (
            <div key={i} className="flex items-start gap-5 p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-200 transition-colors">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 shadow-sm">
                <r.icon size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-slate-900 uppercase tracking-tight text-sm">{r.label}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${r.badgeStyle}`}>{r.label}</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
