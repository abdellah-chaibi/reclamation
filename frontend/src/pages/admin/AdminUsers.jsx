import { useState, useEffect } from 'react';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const roleLabel = { admin: 'Admin', chef_dep: 'Chef Service', employe: 'Employee', citoyen: 'Citizen' };
const emptyForm = { name: '', email: '', password: '', departement_id: '', role: 'citoyen', cin: '' };

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [depts, setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      setUsers(Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []));
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
    } catch { setError('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErrors(p => ({ ...p, [e.target.name]: '' })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    setSubmitting(true);
    try {
      await userService.create(form);
      setSuccess('User created successfully.');
      setForm(emptyForm); setShowModal(false); fetchAll();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) { const m = {}; Object.keys(msgs).forEach(k => m[k] = msgs[k][0]); setErrors(m); }
      else setError(err?.response?.data?.message || 'Failed to create user.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await userService.delete(id); fetchAll(); }
    catch { setError('Failed to delete user.'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title">👥 Users</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="form-control" style={{ width: 220 }} placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setErrors({}); setError(''); }}>＋ Add User</button>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={`badge badge-role-${u.role}`}>{roleLabel[u.role] || u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.departement?.name || '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Create New User</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {[{ name: 'name', label: 'Full Name', placeholder: 'Name' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
                { name: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 chars' },
                { name: 'cin', label: 'CIN (optional)', placeholder: 'e.g. AB123456' },
              ].map(f => (
                <div className="form-group" key={f.name}>
                  <label>{f.label}</label>
                  <input name={f.name} type={f.type || 'text'} className="form-control" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
                  {errors[f.name] && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors[f.name]}</span>}
                </div>
              ))}
              <div className="form-group">
                <label>Role</label>
                <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                  <option value="citoyen">Citizen</option>
                  <option value="employe">Employee</option>
                  <option value="chef_dep">Chef Service</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select name="departement_id" className="form-control" value={form.departement_id} onChange={handleChange}>
                  <option value="">— None —</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departement_id && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.departement_id}</span>}
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating…' : 'Create User'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
