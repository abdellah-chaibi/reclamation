import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const roleLabel = { admin: 'Administrateur', chef_dep: 'Chef de Service', employe: 'Employé', citoyen: 'Citoyen' };

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    password: '',
    password_confirmation: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError('Le nom et l\'email sont requis.'); return; }
    if (form.password && form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
        delete payload.password_confirmation;
      }
      await userService.update(user.id, payload);
      setSuccess('Profil mis à jour avec succès.');
      setForm(p => ({ ...p, password: '', password_confirmation: '' }));
      setEditing(false);
      // Optional: dispatch event or update context if user data visually changes
      window.dispatchEvent(new Event('auth:update'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Échec de la mise à jour du profil.');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-wrapper fade-up" style={{ maxWidth: 680 }}>
      <div className="section-header">
        <h2 className="section-title">👤 Mon Profil</h2>
        {!editing && <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Modifier</button>}
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
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Modifier le profil</h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Nom complet</label>
              <input name="name" className="form-control" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Adresse E-mail</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe (laisser vide pour ne pas modifier)</label>
              <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} minLength={6} />
            </div>
            {form.password && (
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input name="password_confirmation" type="password" className="form-control" value={form.password_confirmation} onChange={handleChange} required minLength={6} />
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Enregistrement…' : '💾 Enregistrer'}</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setEditing(false); setError(''); setForm(p => ({...p, password: '', password_confirmation: ''})) }}>Annuler</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Détails du compte</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { label: 'Nom complet', value: user?.name },
              { label: 'E-mail', value: user?.email },
              { label: 'Rôle', value: roleLabel[user?.role] || user?.role },
              { label: 'Département', value: user?.departement?.name || '—' },
              { label: 'CIN', value: user?.cin || '—' },
              { label: 'Membre depuis', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—' },
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
