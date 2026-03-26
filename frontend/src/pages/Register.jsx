import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from './../assets/Logo.png';
import { User, Mail, Lock, UserPlus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

// Enhanced Field component using Tailwind
function Field({ name, label, type = 'text', placeholder, value, onChange, error, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          {Icon && <Icon size={18} />}
        </div>
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl outline-none transition-all
            ${error 
              ? 'border-red-500 focus:ring-2 focus:ring-red-100' 
              : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'
            }`}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 flex items-center gap-1 ml-1 mt-0.5">
          <AlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis.';
    if (!form.email) errs.email = "L'adresse e-mail est requise.";
    if (form.password.length < 8) errs.password = 'Le mot de passe doit contenir au moins 8 caractères.';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Les mots de passe ne correspondent pas.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/home', { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      setServerError(data?.message || "Échec de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-12 overflow-hidden font-inter">
      {/* Dynamic Background Decor (matching Welcome page) */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-[480px] z-10">
        {/* Logo and Back Link */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold text-slate-600">Retour</span>
          </Link>
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl shadow-slate-200/50">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Créer un compte</h1>
            <p className="text-slate-500 mt-2 font-medium">Rejoignez l'espace citoyen officiel</p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-medium">{serverError}</p>
            </div>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <Field
              name="name"
              label="Nom Complet"
              placeholder="Ex: Ahmed Alaoui"
              icon={User}
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Field
              name="email"
              label="Adresse E-mail"
              type="email"
              placeholder="nom@exemple.com"
              icon={Mail}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Field
              name="password"
              label="Mot de passe"
              type="password"
              placeholder="8 caractères minimum"
              icon={Lock}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
            <Field
              name="password_confirmation"
              label="Confirmer le mot de passe"
              type="password"
              placeholder="Confirmez votre mot de passe"
              icon={Lock}
              value={form.password_confirmation}
              onChange={handleChange}
              error={errors.password_confirmation}
            />

            <button 
              type="submit" 
              disabled={loading}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              <span>{loading ? 'Création en cours...' : "S'inscrire"}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-sm font-medium">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold ml-1 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-8 text-xs text-slate-400 font-semibold uppercase tracking-widest">
          Commune Territoriale Kasba Tadla
        </p>
      </div>
    </div>
  );
}