import { useState, useEffect } from 'react';
import { reclamationService, departementService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUSES = [
  { value: 'en_attent', label: 'En Attente' },
  { value: 'en_cours',  label: 'En Cours' },
  { value: 'traite',    label: 'Traitée' },
  { value: 'rejete',    label: 'Rejetée' },
];

export default function AdminReclamations() {
  const [recs, setRecs]   = useState([]);
  const [depts, setDepts] = useState([]);
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
      const [rRes, dRes] = await Promise.all([reclamationService.getAll(), departementService.getAll()]);
      const r = rRes.data?.data || rRes.data || []; setRecs(Array.isArray(r) ? r : []);
      const d = dRes.data?.data || dRes.data || []; setDepts(Array.isArray(d) ? d : []);
    } catch { setError('Échec du chargement des réclamations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async (id) => {
    if (!editDept) return;
    setSaving(true);
    try { await reclamationService.update(id, { departement_id: parseInt(editDept) }); setEditId(null); fetchAll(); }
    catch { setError('Échec de la mise à jour du département.'); }
    finally { setSaving(false); }
  };

  const filtered = recs.filter(r => {
    const matchStatus = !filter || r.status === filter;
    const matchDept = !deptFilter || String(r.departement_id) === deptFilter;
    return matchStatus && matchDept;
  });

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title">📋 Toutes les Réclamations</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 170 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">Tous les Statuts</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="form-control" style={{ width: 190 }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">Tous les Départements</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? <LoadingSpinner /> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Titre</th><th>Utilisateur</th><th>Département</th><th>Statut</th><th>Date</th><th>Assigner Dép.</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucune réclamation trouvée.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{r.id}</td>
                  <td><strong>{r.title}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>#{r.user_id}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {depts.find(d => d.id === r.departement_id)?.name || `#${r.departement_id}`}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    {editId === r.id ? (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <select className="form-control" style={{ width: 130, padding: '0.3rem' }} value={editDept} onChange={(e) => setEditDept(e.target.value)}>
                          <option value="">— Sélectionner —</option>
                          {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button className="btn btn-success btn-sm" onClick={() => handleAssign(r.id)} disabled={saving}>✓</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>✕</button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(r.id); setEditDept(String(r.departement_id)); }}>
                        Ré-assigner
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
