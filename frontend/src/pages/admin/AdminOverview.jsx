import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building2,
  MessageSquare,
  Briefcase,
  LayoutDashboard,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentLanguage, getLocalizedText } from '../../utils/localization';

export default function AdminOverview({ stats }) {
  const { i18n } = useTranslation();
  const language = getCurrentLanguage(i18n.language);

  const cards = [
    {
      label: getLocalizedText({ ar: 'المستخدمون', fr: 'Utilisateurs' }, language),
      value: stats.users,
      icon: Users,
      color: 'blue',
      description: getLocalizedText({ ar: 'المستخدمون المسجلون', fr: 'Utilisateurs inscrits' }, language),
      to: '/admin/users',
    },
    {
      label: getLocalizedText({ ar: 'الأقسام', fr: 'Departements' }, language),
      value: stats.depts,
      icon: Building2,
      color: 'emerald',
      description: getLocalizedText({ ar: 'المصالح النشيطة', fr: 'Services actifs' }, language),
      to: '/admin/departements',
    },
    {
      label: getLocalizedText({ ar: 'الشكايات', fr: 'Reclamations' }, language),
      value: stats.recs,
      icon: MessageSquare,
      color: 'amber',
      description: getLocalizedText({ ar: 'إجمالي المتوصل بها', fr: 'Total recu' }, language),
      to: '/admin/reclamations',
    },
    {
      label: getLocalizedText({ ar: 'الموظفون', fr: 'Employes' }, language),
      value: stats.employees,
      icon: Briefcase,
      color: 'indigo',
      description: getLocalizedText({ ar: 'موظفو المصالح', fr: 'Agents des services' }, language),
      to: '/admin/employees',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" size={32} />
          {getLocalizedText({ ar: 'لوحة تحكم الإدارة', fr: "Tableau de bord d'administration" }, language)}
        </h2>
        <p className="text-slate-500 font-medium">
          {getLocalizedText({ ar: 'نظرة عامة مباشرة على المنصة ديالك.', fr: 'Vue generale en temps reel de votre plateforme.' }, language)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 relative overflow-hidden"
          >
            <Link to={card.to}>
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${card.color}-50 rounded-full opacity-50 group-hover:scale-110 transition-transform`} />

              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600 mb-5`}>
                  <card.icon size={24} />
                </div>

                <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter mb-1">
                    {card.value}
                  </span>
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                    {card.label}
                  </span>
                  <p className="text-xs font-medium text-slate-500 mt-3 flex items-center gap-1">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 text-slate-200 group-hover:text-blue-500 transition-colors">
                <ArrowUpRight size={20} />
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

        <div className="relative z-10 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-2xl text-white mb-2">
            <LayoutDashboard size={24} />
          </div>
          <h3 className="text-xl font-bold text-white">
            {getLocalizedText({ ar: 'تدبير المنصة', fr: 'Gestion de la plateforme' }, language)}
          </h3>
          <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
            {getLocalizedText(
              { ar: 'استعمل أدوات التصفح باش تسير حسابات المستخدمين، تنظم الأقسام، وتتابع حالة الشكايات ديال المواطنين.', fr: 'Utilisez les outils de navigation pour gerer les comptes utilisateurs, organiser les departements et suivre les reclamations des citoyens.' },
              language,
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
