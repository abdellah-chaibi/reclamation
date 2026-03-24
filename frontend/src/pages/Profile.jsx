import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const roleLabel = { admin: 'Administrator', chef_dep: 'Chef Service', employe: 'Employee', citoyen: 'Citizen' };

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      await userService.update(user.id, form);
      setSuccess('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper fade-up" style={{ maxWidth: 680 }}>
      <div className="section-header">
        <h2 className="section-title">👤 My Profile</h2>
        {!editing && <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Edit</button>}
      </div>

      {/* Avatar card */}
      <div className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1.3rem' }}>{user?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-role-${user?.role}`}>{roleLabel[user?.role] || user?.role}</span>
            {user?.departement?.name && (
              <span className="badge badge-info" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--info)', border: '1px solid rgba(6,182,212,0.3)' }}>
                🏢 {user.departement.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}
      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Edit form */}
      {editing ? (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Edit Profile</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : '💾 Save Changes'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setError(''); }}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Account Details</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Role', value: roleLabel[user?.role] || user?.role },
              { label: 'Department', value: user?.departement?.name || '—' },
              { label: 'CIN', value: user?.cin || '—' },
              { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
