import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import logo from './../assets/Logo.png';
import { Mail, Lock, LogIn, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

const ROLE_REDIRECT = {
  admin: '/admin',
  chef_dep: '/chef',
  employe: '/employee',
  citoyen: '/home',
};

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError(t('auth.login.requiredFields'));
      return;
    }
    setLoading(true);
    try {
      const user = await login(form);
      navigate(ROLE_REDIRECT[user.role] || '/home', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || t('auth.login.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[440px] z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="h-12 w-auto mb-6" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('auth.login.title')}</h1>
          <p className="text-slate-500 mt-2 font-medium">{t('auth.login.subtitle')}</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Field id="email" name="email" label={t('auth.login.email')} type="email" placeholder={t('auth.login.emailPlaceholder')} value={form.email} onChange={handleChange} icon={Mail} />
            <Field id="password" name="password" label={t('auth.login.password')} type="password" placeholder={t('auth.login.passwordPlaceholder')} value={form.password} onChange={handleChange} icon={Lock} />

            <button type="submit" disabled={loading} className="mt-2 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
              <span>{loading ? t('auth.login.loading') : t('auth.login.submit')}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm font-medium">
              {t('auth.login.noAccount')}{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">
                {t('auth.login.createAccount')}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">{t('auth.login.backHome')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ id, name, label, type, placeholder, value, onChange, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-700 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={18} />
        </div>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />
      </div>
    </div>
  );
}
