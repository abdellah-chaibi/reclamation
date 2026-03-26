import { useState, useEffect } from 'react';
import { departementService, userService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Building2, Plus, Edit2, Trash2, X, 
  CheckCircle, AlertCircle, User, Briefcase, RefreshCw 
} from 'lucide-react';

export default function AdminDepartements() {
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', user_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dRes, uRes] = await Promise.all([departementService.getAll(), userService.getAll()]);
      const d = dRes.data?.data || dRes.data || []; 
      setDepts(Array.isArray(d) ? d : []);
      const u = uRes.data || []; 
      setUsers(Array.isArray(u) ? u.filter(x => x.role === 'chef_dep') : []);
    } catch { setError('Échec du chargement des départements.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // Automatic cleanup for notifications
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => { setSuccess(''); setError(''); }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const openCreate = () => { 
    setEditItem(null); 
    setForm({ name: '', user_id: '' }); 
    setError(''); 
    setShowModal(true); 
  };

  const openEdit = (d) => { 
    setEditItem(d); 
    setForm({ name: d.name, user_id: d.user_id || '' }); 
    setError(''); 
    setShowModal(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError('');
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    setSubmitting(true);
    try {
      if (editItem) { 
        await departementService.update(editItem.id, form); 
        setSuccess('Département mis à jour.'); 
      } else { 
        await departementService.create(form); 
        setSuccess('Département créé.'); 
      }
      setShowModal(false); 
      fetchAll();
    } catch (err) { 
      setError(err?.response?.data?.message || 'L\'opération a échoué.'); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce département ?')) return;
    try { 
      await departementService.delete(id); 
      setSuccess('Département supprimé.');
      fetchAll(); 
    } catch { 
      setError('Impossible de supprimer — des données y sont liées.'); 
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Building2 className="text-blue-600" size={28} />
            Départements
          </h2>
          <p className="text-slate-500 text-sm font-medium">Structure organisationnelle de la commune.</p>
        </div>
        <button 
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-sm"
        >
          <Plus size={18} /> <span>Nouveau</span>
        </button>
      </div>

      {/* Floating Notifications */}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {error && (
          <div className="p-4 bg-white border-l-4 border-red-500 shadow-2xl rounded-lg flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-lg flex items-center gap-3 text-emerald-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
            <CheckCircle size={18} /> {success}
          </div>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Département</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Chef de Service</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {depts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                      Aucun département trouvé.
                    </td>
                  </tr>
                ) : depts.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">#{d.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Briefcase size={16} />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
  <div className="flex items-center gap-2">
    {/* 1. Try to find the user in our local 'users' state using the department's user_id */}
    {(() => {
      const assignedChef = users.find(u => String(u.id) === String(d.user_id));
      
      if (assignedChef) {
        return (
          <>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
              {assignedChef.name?.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-slate-600">
              {assignedChef.name}
            </span>
          </>
        );
      }
      
      // 2. Fallback to d.chef if your backend actually returns it sometimes
      if (d.chef) {
        return (
          <>
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
              {d.chef.name?.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-slate-600">{d.chef.name}</span>
          </>
        );
      }

      // 3. Final Fallback if nothing is found
      return <span className="text-xs text-slate-300 font-medium italic">Non assigné</span>;
    })()}
  </div>
</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => openEdit(d)} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(d.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900">{editItem ? 'Modifier' : 'Nouveau'} Département</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom du département</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-slate-300" size={16} />
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-medium" 
                    placeholder="ex. Ressources Humaines" 
                    value={form.name} 
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} 
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Chef de Service</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-300" size={16} />
                  <select 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold appearance-none" 
                    value={form.user_id} 
                    onChange={(e) => setForm(p => ({ ...p, user_id: e.target.value }))}
                  >
                    <option value="">— Aucun —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  {editItem ? 'Mettre à jour' : 'Créer'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}