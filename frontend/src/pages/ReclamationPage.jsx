import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { reclamationService, departementService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Plus, X, MapPin, Paperclip, Send, Building2, 
  Calendar, AlertCircle, CheckCircle2, FileText, 
  Image as ImageIcon, Video, RefreshCw, Lock
} from 'lucide-react';

const emptyForm = { title: '', content: '', latitude: '', longitude: '', departement_id: '', media: null };

export default function ReclamationPage() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [reclamations, setReclamations] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoadingList(true);
    try {
      const [rRes, dRes] = await Promise.all([
        reclamationService.getAll(),
        departementService.getAll(),
      ]);
      const all = rRes.data?.data || rRes.data || [];
      setReclamations(Array.isArray(all) ? all.filter(r => r.user_id === user?.id) : []);
      const depts = dRes.data?.data || dRes.data || [];
      setDepartements(Array.isArray(depts) ? depts : []);
    } catch { 
      setErrorMsg('Échec du chargement des données.'); 
    } finally { 
      setLoadingList(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(p => ({ ...p, media: file }));
      setPreviewUrl(URL.createObjectURL(file));
      setErrors(p => ({ ...p, media: '' }));
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('La géolocalisation n\'est pas supportée.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(p => ({ 
          ...p, 
          latitude: pos.coords.latitude.toFixed(6), 
          longitude: pos.coords.longitude.toFixed(6) 
        }));
        setErrors(p => ({ ...p, latitude: '', longitude: '' }));
      },
      () => setErrorMsg('Impossible d\'obtenir la localisation.')
    );
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Le titre est requis.';
    if (!form.content.trim()) errs.content = 'La description est requise.';
    if (!form.departement_id) errs.departement_id = 'Veuillez choisir un département.';
    if (!form.latitude) errs.latitude = 'Veuillez détecter votre position.';
    if (!form.media) errs.media = 'Une preuve (image ou vidéo) est requise.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); 
    setErrorMsg('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('departement_id', form.departement_id);
      formData.append('latitude', form.latitude);
      formData.append('longitude', form.longitude);
      formData.append('user_id', user.id);
      if (form.media) formData.append('media[]', form.media);

      await reclamationService.createWithMedia(formData);
      setSuccessMsg('Réclamation soumise avec succès !');
      setForm(emptyForm);
      setPreviewUrl(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setErrorMsg('Erreur lors de la soumission. Veuillez réessayer.');
    } finally { 
      setSubmitting(false); 
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mes Réclamations</h1>
          <p className="text-slate-500 font-medium">Gérez et suivez l'état de vos signalements.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
            showForm ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
          }`}
        >
          {showForm ? <X size={20} /> : <Plus size={20} />}
          {showForm ? 'Annuler' : 'Nouvelle Réclamation'}
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
          <CheckCircle2 size={20} /> <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} /> <span className="font-bold text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Submission Form Card */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-2xl mb-12 animate-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Titre de l'incident</label>
                <input 
                  name="title" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="Ex: Éclairage défectueux..."
                  value={form.title} onChange={handleChange}
                />
                {errors.title && <p className="text-red-500 text-xs font-bold mt-1">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Description détaillée</label>
                <textarea 
                  name="content" rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="Expliquez le problème ici..."
                  value={form.content} onChange={handleChange}
                />
                {errors.content && <p className="text-red-500 text-xs font-bold mt-1">{errors.content}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Département concerné</label>
                <select 
                  name="departement_id"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all appearance-none"
                  value={form.departement_id} onChange={handleChange}
                >
                  <option value="">Sélectionner...</option>
                  {departements.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departement_id && <p className="text-red-500 text-xs font-bold mt-1">{errors.departement_id}</p>}
              </div>
            </div>

            <div className="space-y-6">
              {/* Media Upload with Preview */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Preuve (Image ou Vidéo)</label>
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="relative group h-48 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all overflow-hidden"
                >
                  {previewUrl ? (
                    form.media?.type.startsWith('video') ? (
                      <video src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    )
                  ) : (
                    <>
                      <div className="flex gap-2 text-slate-300 mb-2">
                        <ImageIcon size={32} /> <Video size={32} />
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-blue-500">Cliquez pour ajouter un média</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" multiple hidden accept="image/*,video/*" onChange={handleFileChange} />
                </div>
                {errors.media && <p className="text-red-500 text-xs font-bold mt-1">{errors.media}</p>}
              </div>

              {/* Read-only Location Section */}
              <div className="bg-white-900 rounded-[2rem] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">Position GPS</span>
                  <button type="button" onClick={useMyLocation} className="text-xs bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2 font-bold">
                    <MapPin size={14} /> Détecter
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">{form.latitude || '0.0000'}</span>
                    <Lock size={14} className="text-slate-600" title="Verrouillé" />
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-400">{form.longitude || '0.0000'}</span>
                    <Lock size={14} className="text-slate-600" title="Verrouillé" />
                  </div>
                </div>
                {errors.latitude && <p className="text-red-400 text-[10px] font-bold mt-2 uppercase tracking-tighter">Veuillez cliquer sur Détecter</p>}
              </div>

              <button 
                type="submit" disabled={submitting}
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 transition-all"
              >
                {submitting ? <RefreshCw className="animate-spin" /> : <Send size={20} />}
                Envoyer la réclamation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Section */}
      {loadingList ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : reclamations.length === 0 ? (
        <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="font-bold text-slate-400">Aucune réclamation enregistrée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {reclamations.map(r => (
            <div key={r.id} className="group bg-white border border-slate-200 p-6 md:p-8 rounded-[2.5rem] hover:shadow-xl hover:border-blue-100 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">{r.title}</h3>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-2xl">{r.content}</p>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Building2 size={14} /> {r.departement?.name || 'Général'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Calendar size={14} /> {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </div>
                    {r.latitude && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <MapPin size={14} /> Localisé
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col justify-end gap-2">
                  {r.medias?.map(m => (
                    <a 
                      key={m.id} 
                      href={`http://localhost:8000/storage/${m.path}`} 
                      target="_blank" rel="noreferrer"
                      className="group relative h-24 w-full md:w-32 rounded-2xl overflow-hidden border border-slate-100 shadow-sm"
                    >
                      <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                        <Paperclip className="text-white" size={16} />
                      </div>
                      <img src={`http://localhost:8000/storage/${m.path}`} className="w-full h-full object-cover" alt="PJ" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}