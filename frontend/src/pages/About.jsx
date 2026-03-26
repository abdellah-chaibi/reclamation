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
  Heart
} from 'lucide-react';

export default function About() {
  const features = [
    { icon: ClipboardCheck, title: 'Soumission Facile', desc: 'Les citoyens peuvent soumettre des réclamations avec photos et détails en quelques minutes.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Building2, title: 'Routage Intelligent', desc: 'Les réclamations sont automatiquement dirigées vers le service responsable (Travaux, Éclairage, etc.).', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: RefreshCw, title: 'Suivi en Temps Réel', desc: 'Mises à jour instantanées du statut, de "En Attente" jusqu\'à "Traité".', color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Users, title: 'Collaboration d\'Équipe', desc: 'Les chefs de service assignent des tâches et suivent l\'avancement efficacement.', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: ShieldCheck, title: 'Sécurisé & Privé', desc: 'Toutes les données sont protégées par une authentification robuste et un contrôle d\'accès strict.', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: MapPin, title: 'Géo-localisation', desc: 'Les coordonnées GPS aident les départements à localiser précisément les problèmes sur le terrain.', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  const roles = [
    { label: 'Citoyen', icon: UserIcon, badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-100', desc: 'Soumettez et suivez vos réclamations personnelles de n\'importe où.' },
    { label: 'Employé', icon: Wrench, badgeStyle: 'bg-amber-50 text-amber-700 border-amber-100', desc: 'Gérez les interventions techniques assignées par votre Chef de service.' },
    { label: 'Chef de Service', icon: BarChart3, badgeStyle: 'bg-purple-50 text-purple-700 border-purple-100', desc: 'Assignez les tâches, gérez vos équipes et validez les résolutions.' },
    { label: 'Administrateur', icon: Settings, badgeStyle: 'bg-blue-50 text-blue-700 border-blue-100', desc: 'Gestion complète de la plateforme : utilisateurs, départements et rapports.' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-16 mb-16 text-center shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-6 border border-white/20">
            <Building2 className="text-white" size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">À propos de ReclamApp</h1>
          <p className="text-slate-300 text-lg leading-relaxed font-medium">
            ReclamApp est une plateforme citoyenne conçue pour combler le fossé entre les citoyens et l'administration locale. 
            Notre mission est de rendre la gestion des réclamations transparente, efficace et accessible à tous pour une ville meilleure.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Nos Services</h2>
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

      {/* Roles Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">Les Acteurs</h2>
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
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${r.badgeStyle}`}>
                    {r.label}
                  </span>
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