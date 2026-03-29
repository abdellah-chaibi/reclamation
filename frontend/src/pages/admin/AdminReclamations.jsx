import { useState, useEffect } from 'react';
import { reclamationService, departementService, userService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  ClipboardList, Building2, Calendar,
  User, Check, X, RefreshCw, AlertCircle,
} from 'lucide-react';

const STATUSES = [
  { value: 'en_attent', label: 'En Attente' },
  { value: 'en_cours', label: 'En Cours' },
  { value: 'terminee', label: 'Terminee' },
  { value: 'rejete', label: 'Rejetee' },
];

export default function AdminReclamations() {
  const [recs, setRecs] = useState([]);
  const [depts, setDepts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editDept, setEditDept] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, dRes, uRes] = await Promise.all([
        reclamationService.getAll(),
        departementService.getAll(),
        userService.getAll(),
      ]);
      const r = rRes.data?.data || rRes.data || [];
      const sortedRecs = Array.isArray(r)
        ? [...r].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        : [];
      setRecs(sortedRecs);
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
      const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setUsers(Array.isArray(u) ? u : []);
    } catch {
      setError('Echec du chargement des reclamations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAssign = async (id) => {
    const currentReclamation = recs.find((rec) => rec.id === id);
    if (!editDept || currentReclamation?.status !== 'en_attent') return;

    setSaving(true);
    setError('');
    try {
      await reclamationService.update(id, { departement_id: parseInt(editDept, 10) });
      setEditId(null);
      fetchAll();
    } catch {
      setError('Echec de la mise a jour du departement.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = recs.filter((r) => {
    const matchStatus = !filter || r.status === filter;
    const matchDept = !deptFilter || String(r.departement_id) === deptFilter;
    return matchStatus && matchDept;
  });

  const getCitoyenName = (reclamation) => {
    if (reclamation.user?.name) return reclamation.user.name;
    if (reclamation.citoyen?.name) return reclamation.citoyen.name;

    const matchedUser = users.find((user) => String(user.id) === String(reclamation.user_id));
    return matchedUser?.name || `ID #${reclamation.user_id}`;
  };

  return (
    <div className="animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={28} />
            Gestion des Reclamations
          </h2>
          <p className="text-slate-500 text-sm font-medium">Suivi et distribution des requetes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
            <select
              className="bg-transparent px-3 py-1.5 outline-none text-xs font-bold text-slate-600 border-r border-slate-100"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">Tous les Statuts</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              className="bg-transparent px-3 py-1.5 outline-none text-xs font-bold text-slate-600"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">Tous les Departements</option>
              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-top-4">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex justify-center"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Reclamation</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Auteur & Dep.</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">Aucune reclamation trouvee.</td>
                  </tr>
                ) : filtered.map((r) => {
                  const canAssign = r.status === 'en_attent';
                  const citoyenName = getCitoyenName(r);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-400">#{r.id}</td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs sm:max-w-md">
                          <p className="font-bold text-slate-900 text-sm mb-1 truncate">{r.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium uppercase">
                            <Calendar size={12} />
                            {new Date(r.created_at).toLocaleDateString('fr-FR')}
                          </div>
                          {r.refusal_reason && (
                            <p className="mt-2 text-xs text-red-600 line-clamp-2">{r.refusal_reason}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <User size={12} className="text-slate-300" /> {citoyenName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Building2 size={12} />
                            {depts.find((d) => d.id === r.departement_id)?.name || 'Non assigne'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editId === r.id && canAssign ? (
                          <div className="flex items-center justify-end gap-1 animate-in zoom-in-95 duration-200">
                            <select
                              className="text-[11px] font-bold px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                              value={editDept}
                              onChange={(e) => setEditDept(e.target.value)}
                            >
                              <option value="">Assigner...</option>
                              {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <button
                              className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              onClick={() => handleAssign(r.id)}
                              disabled={saving}
                            >
                              {saving ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />}
                            </button>
                            <button
                              className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                              onClick={() => setEditId(null)}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl border transition-all ${
                              canAssign
                                ? 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-600 hover:text-white'
                                : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
                            }`}
                            onClick={() => {
                              if (!canAssign) return;
                              setEditId(r.id);
                              setEditDept(String(r.departement_id || ''));
                            }}
                            disabled={!canAssign}
                          >
                            Depecher
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-slate-400 text-[11px] font-medium uppercase tracking-widest">
        Fin de la liste - {filtered.length} reclamations
      </p>
    </div>
  );
}
