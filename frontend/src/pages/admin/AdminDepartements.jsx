import { useState, useEffect } from 'react';
import { departementService, userService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDepartements() {
  const [depts, setDepts]   = useState([]);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm]     = useState({ name: '', user_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dRes, uRes] = await Promise.all([departementService.getAll(), userService.getAll()]);
      const d = dRes.data?.data || dRes.data || []; setDepts(Array.isArray(d) ? d : []);
      const u = uRes.data || []; setUsers(Array.isArray(u) ? u.filter(x => x.role === 'chef_dep') : []);
    } catch { setError('Échec du chargement des départements.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name: '', user_id: '' }); setError(''); setShowModal(true); };
  const openEdit   = (d)  => { setEditItem(d); setForm({ name: d.name, user_id: d.user_id || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name.trim()) { setError('Le nom est requis.'); return; }
    setSubmitting(true);
    try {
      if (editItem) { await departementService.update(editItem.id, form); setSuccess('Département mis à jour.'); }
      else          { await departementService.create(form); setSuccess('Département créé.'); }
      setShowModal(false); fetchAll();
    } catch (err) { setError(err?.response?.data?.message || 'L\'opération a échoué.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce département ?')) return;
    try { await departementService.delete(id); fetchAll(); }
    catch { setError('Impossible de supprimer — peut avoir des utilisateurs ou réclamations assignés.'); }
  };

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title">🏢 Départements</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>＋ Nouveau Département</button>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Nom</th><th>Chef de Service</th><th>Actions</th></tr></thead>
            <tbody>
              {depts.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun département trouvé.</td></tr>
              ) : depts.map(d => (
                <tr key={d.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{d.id}</td>
                  <td><strong>{d.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.chef?.name || '— Non Assigné —'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>✏️ Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Modifier le Département' : 'Nouveau Département'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Nom du Département *</label>
                <input className="form-control" placeholder="ex. Travaux Publics" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Assigner un Chef de Service</label>
                <select className="form-control" value={form.user_id} onChange={(e) => setForm(p => ({ ...p, user_id: e.target.value }))}>
                  <option value="">— Aucun —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Sauvegarde…' : (editItem ? 'Mettre à jour' : 'Créer')}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
