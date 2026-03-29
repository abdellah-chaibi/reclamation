import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ className = '', compact = false }) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Languages size={16} />
      </span>
      {!compact && (
        <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-slate-500 sm:inline">
          {t('common.language')}
        </span>
      )}
      <button
        type="button"
        onClick={() => changeLanguage('fr')}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
          i18n.language === 'fr' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {t('common.french')}
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('ar')}
        className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
          i18n.language === 'ar' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {t('common.arabic')}
      </button>
    </div>
  );
}
