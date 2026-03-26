import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  UserPlus, Search, Filter, Edit2, Trash2,
  Building2, X, CheckCircle, AlertCircle,
  Users, RefreshCw
} from 'lucide-react';

const roleLabel = { admin: 'Admin', chef_dep: 'Chef de Service', employe: 'Employé', citoyen: 'Citoyen' };
const normalizeRole = (role) => {
  if (role === 'user' || role === 'citizen') return 'citoyen';
  return role;
};
const emptyForm = { name: '', email: '', password: '', departement_id: '', role: 'citoyen', cin: '' };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const uData = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setUsers(uData.filter(u => u.id !== currentUser?.id));
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
    } catch { setError('Échec du chargement des utilisateurs.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => {
      const updated = { ...p, [name]: value };
      if (name === 'role' && value === 'citoyen') updated.departement_id = '';
      return updated;
    });
    setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (userToEdit) => {
    setForm({
      name: userToEdit.name,
      email: userToEdit.email,
      password: '',
      departement_id: userToEdit.departement_id || '',
      role: userToEdit.role,
      cin: userToEdit.cin || ''
    });
    setEditingId(userToEdit.id);
    setErrors({});
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (editingId && !payload.password) delete payload.password;
      if (payload.role === 'citoyen') delete payload.departement_id;

      if (editingId) {
        await userService.update(editingId, payload);
        setSuccess('Utilisateur mis à jour.');
      } else {
        await userService.create(payload);
        setSuccess('Utilisateur créé.');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) { 
        const m = {};
        Object.keys(msgs).forEach(k => { m[k] = msgs[k][0]; });
        setErrors(m);
        setError(m.departement_id || Object.values(m)[0] || 'Échec de la sauvegarde.');
      }
      else setError(err?.response?.data?.message || 'Échec de la sauvegarde.');
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await userService.delete(deletingId);
      setSuccess('Utilisateur supprimé.');
      setShowDeleteModal(false);
      fetchAll();
    } catch { setError('Échec de la suppression.'); setShowDeleteModal(false); }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? normalizeRole(u.role) === roleFilter : true;
    return matchesSearch && matchesRole;
  });
  //
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000); // 3 seconds

      return () => clearTimeout(timer); // Cleanup timer if component unmounts or state changes
    }
  }, [success, error]);

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Gestion des Utilisateurs
          </h2>
          <p className="text-slate-500 text-sm font-medium">Contrôlez les accès de la plateforme.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full lg:w-56 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all text-sm"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-bold text-slate-700 text-sm"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les rôles</option>
            <option value="citoyen">Citoyen</option>
            <option value="employe">Employé</option>
            <option value="chef_dep">Chef de Service</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 text-sm"
          >
            <UserPlus size={18} /> <span>Ajouter</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {error && (
          <div className="p-4 bg-white border-l-4 border-red-500 shadow-xl rounded-lg flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
            <AlertCircle size={18} /> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-white border-l-4 border-emerald-500 shadow-xl rounded-lg flex items-center gap-3 text-emerald-700 font-bold animate-in slide-in-from-right-full pointer-events-auto">
            <CheckCircle size={18} /> {success}
          </div>
        )}
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Utilisateur</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Rôle</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-none mb-1">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border
                        ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                          u.role === 'chef_dep' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            u.role === 'employe' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-slate-50 text-slate-500 border-slate-200'}
                      `}>
                        {roleLabel[normalizeRole(u.role)] || u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(u)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16} /></button>
                        <button onClick={() => { setDeletingId(u.id); setShowDeleteModal(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compact Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900">{editingId ? 'Modifier' : 'Ajouter'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white rounded-full transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Rôle</label>
                  <select name="role" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold" value={form.role} onChange={handleChange}>
                    <option value="citoyen">Citoyen</option>
                    <option value="employe">Employé</option>
                    <option value="chef_dep">Chef</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">CIN</label>
                  <input name="cin" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" placeholder="AB123..." value={form.cin} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nom Complet</label>
                <input name="name" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" value={form.name} onChange={handleChange} required />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <input name="email" type="email" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" value={form.email} onChange={handleChange} required />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Mot de passe</label>
                <input name="password" type="password" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm" placeholder="••••••••" value={form.password} onChange={handleChange} />
              </div>

              {form.role !== 'citoyen' && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Département</label>
                  <select name="departement_id" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-sm font-bold" value={form.departement_id} onChange={handleChange}>
                    <option value="">— Aucun —</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                  Enregistrer
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-2">Supprimer ?</h3>
            <p className="text-slate-500 text-xs font-medium mb-6">Cette action est définitive pour cet utilisateur.</p>
            <div className="flex gap-2">
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-all text-sm">Supprimer</button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-100 text-slate-500 font-bold py-2.5 rounded-xl hover:bg-slate-200 text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
