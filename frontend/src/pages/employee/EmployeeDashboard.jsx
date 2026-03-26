import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reclamationService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  ClipboardList, CheckCircle2, AlertCircle, ChevronDown, 
  ChevronUp, MapPin, Paperclip, Calendar, Clock, CheckCircle, 
  Wrench,
  WrenchIcon
} from 'lucide-react';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  
  // State to track which reclamation is expanded
  const [expandedId, setExpandedId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await reclamationService.getAll();
      const r = res.data?.data || res.data || [];
      const myDeptId = user?.departement_id;
      setRecs(Array.isArray(r) ? r.filter(x => x.departement_id === myDeptId) : []);
    } catch { 
      setError('Échec du chargement des tâches assignées.'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Auto-clear alerts
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(''); setError(''); }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleStatusUpdate = async (e, id, newStatus) => {
    e.stopPropagation(); // Prevent card from expanding/collapsing when clicking buttons
    setSaving(true); setError(''); setSuccess('');
    try {
      await reclamationService.update(id, { status: newStatus });
      setSuccess(`Statut mis à jour avec succès.`);
      fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Échec de la mise à jour du statut.');
    } finally { 
      setSaving(false); 
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const todo = recs.filter(r => r.status === 'en_attent' || r.status === 'en_cours');
  const resolved = recs.filter(r => r.status === 'terminee' || r.status === 'rejete');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><WrenchIcon /></span>
          Mes Tâches Assignées
        </h2>
        <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
          <ClipboardList size={18} />
          {recs.length} réclamation(s) dans votre département
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{todo.length}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">À traiter</div>
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-5 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{resolved.length}</div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Résolues</div>
          </div>
        </div>
      </div>

      {/* Floating Notifications */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {success && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
            <CheckCircle className="text-emerald-400" size={20} />
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

      {/* Content */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 min-h-[400px]">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : recs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center text-4xl shadow-sm mb-6">
              🎉
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Tout est clair !</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              Aucune réclamation n'a été affectée à votre département pour le moment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {recs.map((r, index) => {
              const isExpanded = expandedId === r.id;
              return (
                <div 
                  key={r.id} 
                  className={`bg-white border transition-all duration-300 rounded-2xl shadow-sm overflow-hidden ${isExpanded ? 'border-blue-300 ring-4 ring-blue-50' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Clickable Header Area */}
                  <div 
                    className="p-5 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
                    onClick={() => toggleExpand(r.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <span className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {r.title}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} /> {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {r.medias?.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Paperclip size={14} /> {r.medias.length} Fichier(s)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                      {/* Interactive Buttons (Only show when collapsed if space permits, or hide and show below) */}
                      {!isExpanded && r.status !== 'terminee' && r.status !== 'rejete' && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleStatusUpdate(e, r.id, 'en_cours')}
                            disabled={saving || r.status === 'en_cours'}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            En Cours
                          </button>
                        </div>
                      )}
                      <div className={`p-2 rounded-full transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-5 md:px-6 md:py-6 animate-in slide-in-from-top-4 duration-300">
                      
                      {/* Description Content */}
                      {r.content && (
                        <div className="mb-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</h4>
                          <p className="text-slate-700 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            {r.content}
                          </p>
                        </div>
                      )}

                      {/* Attached Media */}
                      {r.medias && r.medias.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                            <Paperclip size={12} /> Pièces jointes ({r.medias.length})
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {r.medias.map(m => (
                              <a 
                                key={m.id} 
                                href={`http://localhost:8000/storage/${m.path}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                onClick={(e) => e.stopPropagation()} // Prevent accordian close
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 rounded-xl text-sm font-bold text-slate-600 transition-all shadow-sm"
                              >
                                <Paperclip size={16} className="text-slate-400" /> 
                                Ouvrir le fichier
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Map Container */}
                      {r.latitude && r.longitude && (
                        <div className="mb-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                            <MapPin size={12} /> Localisation
                          </h4>
                          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0">
                            <MapContainer 
                              center={[parseFloat(r.latitude), parseFloat(r.longitude)]} 
                              zoom={15} 
                              style={{ height: '250px', width: '100%', zIndex: 0 }}
                              scrollWheelZoom={false}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker position={[parseFloat(r.latitude), parseFloat(r.longitude)]}>
                                <Popup className="font-bold">{r.title}</Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons Container */}
                      {r.status !== 'terminee' && r.status !== 'rejete' && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                          <button
                            className="flex-1 flex justify-center items-center gap-2 bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                            onClick={(e) => handleStatusUpdate(e, r.id, 'en_cours')}
                            disabled={saving || r.status === 'en_cours'}
                          >
                            <Clock size={18} /> Marquer "En Cours"
                          </button>
                          
                          <button
                            className="flex-1 flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100 px-6 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
                            onClick={(e) => handleStatusUpdate(e, r.id, 'terminee')}
                            disabled={saving}
                          >
                            <CheckCircle2 size={18} /> Clôturer (Terminée)
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}