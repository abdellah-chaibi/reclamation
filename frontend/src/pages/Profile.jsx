import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { 
  User, Mail, Lock, ShieldCheck, 
  CreditCard, Calendar, Edit3, Save, AlertCircle, RefreshCw, Briefcase, Star
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const [form, setForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    cin: user?.cin || '',
    current_password: '', 
    password: '',
    password_confirmation: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to render role badge
  const renderRoleBadge = (role) => {
    const roles = {
      admin: { label: 'Administrateur', icon: <Star size={12} />, class: 'bg-amber-50 text-amber-600 border-amber-100' },
      citoyen: { label: 'Compte Citoyen', icon: <ShieldCheck size={12} />, class: 'bg-blue-50 text-blue-600 border-blue-100' },
      chef_dep: { label: 'Chef de Service', icon: <Briefcase size={12} />, class: 'bg-purple-50 text-purple-600 border-purple-100' },
      employe: { label: 'Employé', icon: <User size={12} />, class: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    };
    const config = roles[role] || roles.citoyen;
    return (
      <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.class}`}>
        {config.icon} {config.label}
      </div>
    );
  };

  // Auto-clear alerts
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(''); setError(''); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!form.current_password) {
      setError('Mot de passe actuel requis pour confirmer.');
      return;
    }
    if (form.password && form.password !== form.password_confirmation) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      await userService.update(user.id, payload);
      setSuccess('Profil mis à jour avec succès.');
      setEditing(false);
      setForm(p => ({ ...p, current_password: '', password: '', password_confirmation: '' }));
      window.dispatchEvent(new Event('auth:update'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Paramètres</h1>
          <p className="text-slate-500 font-medium">Gérez vos accès et informations</p>
        </div>
        {!editing && (
          <button 
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-2xl font-bold transition-all shadow-sm"
          >
            <Edit3 size={18} /> Modifier le profil
          </button>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50" />
        
        <div className="relative z-10 w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 rotate-0 group-hover:rotate-0 transition-transform">
          {getInitials(user?.name)}
        </div>

        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-900">{user?.name}</h2>
          <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2 text-sm mt-1">
            <Mail size={14} className="text-slate-300" /> {user?.email}
          </p>
          {renderRoleBadge(user?.role)}
        </div>
      </div>

      {/* Alerts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {success && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <ShieldCheck className="text-emerald-400" size={20} />
            <span className="text-sm font-bold">{success}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-600 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden">
        {editing ? (
          <form onSubmit={handleSave} className="p-8 md:p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input name="name" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-semibold" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">CIN</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input name="cin" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-semibold" value={form.cin} onChange={handleChange} placeholder="AB123456" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-slate-300" size={18} />
                <input name="email" type="email" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all font-semibold" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="py-4"><div className="h-px bg-slate-100 w-full" /></div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Validation requise *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-blue-400" size={18} />
                <input name="current_password" type="password" autoComplete="new-password" className="w-full pl-12 pr-5 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-blue-300 font-bold" placeholder="Confirmez avec votre mot de passe actuel" value={form.current_password} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nouveau MDP (Optionnel)</label>
                <input name="password" type="password" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold" value={form.password} onChange={handleChange} minLength={6} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirmation</label>
                <input name="password_confirmation" type="password" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold" value={form.password_confirmation} onChange={handleChange} />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button type="submit" disabled={loading} className="flex-[2] bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                Enregistrer les modifications
              </button>
              <button type="button" onClick={() => setEditing(false)} className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 md:p-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
              <User size={14} className="text-blue-500" /> Informations du compte
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'Identité', value: user?.name, icon: <User size={16}/> },
                { label: 'E-mail principal', value: user?.email, icon: <Mail size={16}/> },
                { label: 'N° Carte Nationale (CIN)', value: user?.cin || '—', icon: <CreditCard size={16}/> },
                
                // CONDITIONAL DEPARTMENT RENDERING
                ...( ['chef_dep', 'employe'].includes(user?.role) 
                  ? [{ 
                      label: 'Département', 
                      value: user?.departement?.name || user?.department?.name || 'Non assigné', 
                      icon: <Briefcase size={16}/> 
                    }] 
                  : [] 
                ),
                
                { label: 'Date d\'inscription', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—', icon: <Calendar size={16}/> },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-500">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Lock size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Sécurité du compte</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Votre mot de passe a été configuré lors de votre inscription. 
                    Nous vous recommandons de le changer régulièrement pour protéger vos données.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}