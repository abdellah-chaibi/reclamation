import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const roleLabel = { admin: 'Admin', chef_dep: 'Chef de Service', employe: 'Employé', citoyen: 'Citoyen' };
const emptyForm = { name: '', email: '', password: '', departement_id: '', role: 'citoyen', cin: '' };

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]   = useState([]);
  const [depts, setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm]     = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const uData = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      // Exclude current logged in admin
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
      if (name === 'role' && value === 'citoyen') {
        updated.departement_id = ''; // reset department for citizen
      }
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
      password: '', // Leave blank when editing unless changing
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
      if (editingId && !payload.password) {
        delete payload.password; // Do not send empty password on edit
      }
      if (payload.role === 'citoyen') {
         delete payload.departement_id; // Citoyens don't need department
      }

      if (editingId) {
        await userService.update(editingId, payload);
        setSuccess('Utilisateur mis à jour avec succès.');
      } else {
        await userService.create(payload);
        setSuccess('Utilisateur créé avec succès.');
      }
      setShowModal(false); 
      fetchAll();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) { 
        const m = {}; Object.keys(msgs).forEach(k => m[k] = msgs[k][0]); setErrors(m); 
      }
      else setError(err?.response?.data?.message || 'Échec de la sauvegarde.');
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try { 
      await userService.delete(deletingId); 
      setSuccess('Utilisateur supprimé avec succès.');
      setShowDeleteModal(false);
      fetchAll(); 
    }
    catch { setError('Échec de la suppression de l\'utilisateur.'); setShowDeleteModal(false); }
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title">👥 Utilisateurs</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 160 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">Tous les rôles</option>
            <option value="citoyen">Citoyen</option>
            <option value="employe">Employé</option>
            <option value="chef_dep">Chef de Service</option>
            <option value="admin">Admin</option>
          </select>
          <input className="form-control" style={{ width: 220 }} placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>＋ Ajouter un utilisateur</button>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Nom</th><th>Email</th><th>Rôle</th><th>Département</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Aucun utilisateur trouvé.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><span className={`badge badge-role-${u.role}`}>{roleLabel[u.role] || u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.departement?.name || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(u)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => { setDeletingId(u.id); setShowDeleteModal(true); }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmer la suppression</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <p style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Annuler</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Confirmer la suppression</button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">{editingId ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label>Rôle</label>
                <select name="role" className="form-control" value={form.role} onChange={handleChange}>
                  <option value="citoyen">Citoyen</option>
                  <option value="employe">Employé</option>
                  <option value="chef_dep">Chef de Service</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {[{ name: 'name', label: 'Nom complet', placeholder: 'Nom et prénom' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'email@exemple.com' },
                { name: 'password', label: editingId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe', type: 'password', placeholder: 'Min 6 caractères' },
                { name: 'cin', label: 'CIN (optionnel)', placeholder: 'ex. AB123456' },
              ].map(f => (
                <div className="form-group" key={f.name}>
                  <label>{f.label}</label>
                  <input name={f.name} type={f.type || 'text'} className="form-control" placeholder={f.placeholder} value={form[f.name]} onChange={handleChange} />
                  {errors[f.name] && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors[f.name]}</span>}
                </div>
              ))}

              {form.role !== 'citoyen' && (
                <div className="form-group">
                  <label>Département</label>
                  <select name="departement_id" className="form-control" value={form.departement_id} onChange={handleChange}>
                    <option value="">— Aucun —</option>
                    {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  {errors.departement_id && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.departement_id}</span>}
                </div>
              )}
              
              {error && <div className="alert alert-error">{error}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Enregistrement…' : 'Enregistrer'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
