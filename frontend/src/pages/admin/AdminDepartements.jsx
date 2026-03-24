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
    } catch { setError('Failed to load departments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name: '', user_id: '' }); setError(''); setShowModal(true); };
  const openEdit   = (d)  => { setEditItem(d); setForm({ name: d.name, user_id: d.user_id || '' }); setError(''); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSubmitting(true);
    try {
      if (editItem) { await departementService.update(editItem.id, form); setSuccess('Department updated.'); }
      else          { await departementService.create(form); setSuccess('Department created.'); }
      setShowModal(false); fetchAll();
    } catch (err) { setError(err?.response?.data?.message || 'Operation failed.'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await departementService.delete(id); fetchAll(); }
    catch { setError('Cannot delete — may have assigned users or reclamations.'); }
  };

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title">🏢 Departments</h2>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>＋ New Department</button>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Name</th><th>Chef Service</th><th>Actions</th></tr></thead>
            <tbody>
              {depts.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No departments found.</td></tr>
              ) : depts.map(d => (
                <tr key={d.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{d.id}</td>
                  <td><strong>{d.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{d.chef?.name || '— Unassigned —'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>Delete</button>
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
              <h3 className="modal-title">{editItem ? 'Edit Department' : 'New Department'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Department Name *</label>
                <input className="form-control" placeholder="e.g. Public Works" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Assign Chef Service</label>
                <select className="form-control" value={form.user_id} onChange={(e) => setForm(p => ({ ...p, user_id: e.target.value }))}>
                  <option value="">— None —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : (editItem ? 'Update' : 'Create')}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
