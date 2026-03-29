import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Send, ShieldCheck, Zap, LogIn, ArrowRight } from 'lucide-react';
import logo from './../assets/Logo.png';
import './../App.css';
import Footer from '../components/Footer';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Welcome() {
  const { t } = useTranslation();

  return (
    <div className="welcome-shell">
      <div className="welcome-blob blob-1" aria-hidden="true" />
      <div className="welcome-blob blob-2" aria-hidden="true" />
      <div className="welcome-grid" aria-hidden="true" />

      <nav className="welcome-nav">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t('welcome.official')}</span>
              <span className="text-lg font-extrabold text-slate-900">{t('common.siteName')}</span>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <LanguageSwitcher compact />
            <Link to="/login" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">
              {t('welcome.login')}
            </Link>
            <Link to="/register" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800">
              {t('welcome.register')}
            </Link>
          </div>
        </div>
      </nav>

      <main className="welcome-content">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 pb-12 pt-10 text-center sm:pt-14 lg:pt-16">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {t('welcome.badge')}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t('welcome.titlePrefix')}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              {t('welcome.titleHighlight')}
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">{t('welcome.description')}</p>

          <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link to="/register" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto">
              <span>{t('welcome.primaryCta')}</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:w-auto">
              <LogIn size={18} />
              <span>{t('welcome.secondaryCta')}</span>
            </Link>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard icon={Send} title={t('welcome.cards.reportTitle')} desc={t('welcome.cards.reportDesc')} color="bg-blue-50 text-blue-600" />
          <FeatureCard icon={LayoutDashboard} title={t('welcome.cards.trackTitle')} desc={t('welcome.cards.trackDesc')} color="bg-emerald-50 text-emerald-600" />
          <FeatureCard icon={Zap} title={t('welcome.cards.reactTitle')} desc={t('welcome.cards.reactDesc')} color="bg-amber-50 text-amber-600" />
          <FeatureCard icon={ShieldCheck} title={t('welcome.cards.secureTitle')} desc={t('welcome.cards.secureDesc')} color="bg-rose-50 text-rose-600" />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p>
    </div>
  );
}
