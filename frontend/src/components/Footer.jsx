import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import logo from './../assets/Logo.png';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 w-full border-t border-slate-200/70 bg-white/45 text-slate-700 backdrop-blur-md">
      <div className="mx-auto w-full px-6 py-12 sm:px-8 lg:px-12">
        <div className="rounded-[2rem] border border-white/70 bg-white/60 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.8fr_0.9fr_0.9fr]">
            <div className="space-y-6">
              <Link to="/" className="group flex w-fit items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 transition-colors group-hover:bg-blue-600">
                  <img src={logo} className="h-8 w-auto brightness-0 invert" alt="logo" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-900">{t('common.siteName')}</span>
              </Link>
              <p className="max-w-md text-sm leading-7 text-slate-600">{t('footer.description')}</p>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-slate-900">{t('footer.navigation')}</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-600">
                <li><Link to="/home" className="transition-colors hover:text-sky-700">{t('footer.home')}</Link></li>
                <li><Link to="/about" className="transition-colors hover:text-sky-700">{t('footer.about')}</Link></li>
                <li><Link to="/reclamations" className="transition-colors hover:text-sky-700">{t('footer.citizenSpace')}</Link></li>
                <li><Link to="/profile" className="transition-colors hover:text-sky-700">{t('footer.profile')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 font-bold text-slate-900">{t('footer.contact')}</h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 shrink-0 text-sky-600" />
                  <span>{t('footer.addressLine1')}<br />{t('footer.addressLine2')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-sky-600" />
                  <a href="tel:+2126553254" className="transition-colors hover:text-sky-700">+212 6 55 32 54</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-sky-600" />
                  <a href="mailto:Ckt.Serviceinfo@gmail.ma" className="transition-colors hover:text-sky-700">Ckt.Serviceinfo@gmail.ma</a>
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{t('footer.location')}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{t('footer.addressLine1')} {t('footer.addressLine2')}</p>
              <a
                href="https://maps.google.com/?q=Commune+Kasbah+Tadla"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-200 transition-all hover:-translate-y-0.5 hover:bg-sky-700"
              >
                <span>{t('footer.openMaps')}</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 pt-8 text-center sm:flex-row sm:text-left">
            <p className="text-xs font-medium text-slate-500">&copy; {currentYear} {t('common.siteName')}. {t('footer.rights')}</p>
            <p className="text-xs font-medium text-slate-500">{t('footer.developedBy')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
