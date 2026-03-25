import { useState, useEffect } from 'react';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const emptyForm = { name: '', email: '', password: '', departement_id: '', role: 'employe', cin: '' };

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  
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
  const [deptFilter, setDeptFilter] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setEmployees(u.filter(x => x.role === 'employe'));
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
    } catch { setError('Échec du chargement des employés.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => { 
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' })); 
  };

  const handleOpenCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrors({});
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (empToEdit) => {
    setForm({
      name: empToEdit.name,
      email: empToEdit.email,
      password: '', // Leave blank when editing
      departement_id: empToEdit.departement_id || '',
      role: 'employe',
      cin: empToEdit.cin || ''
    });
    setEditingId(empToEdit.id);
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
        delete payload.password; // Do not send empty password
      }

      if (editingId) {
        await userService.update(editingId, payload);
        setSuccess('Employé mis à jour avec succès.');
      } else {
        await userService.create(payload);
        setSuccess('Employé créé avec succès.');
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
      setSuccess('Employé supprimé avec succès.');
      setShowDeleteModal(false);
      fetchAll(); 
    }
    catch { setError('Échec de la suppression de l\'employé.'); setShowDeleteModal(false); }
  };

  const filtered = employees.filter(emp => {
    const matchesSearch = emp.name?.toLowerCase().includes(search.toLowerCase()) || emp.email?.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter ? String(emp.departement_id) === String(deptFilter) : true;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="fade-up">
      <div className="section-header">
        <div>
          <h2 className="section-title">🔧 Employés</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{employees.length} employés</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 180 }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">Tous les départements</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input className="form-control" style={{ width: 220 }} placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>＋ Ajouter un employé</button>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👷</div>
            <p>Aucun employé trouvé.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Nom</th><th>Email</th><th>Département</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{emp.id}</td>
                    <td><strong>{emp.name}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {emp.departement?.name ? (
                        <span className="badge badge-info" style={{ background: 'rgba(6,182,212,0.1)', color: 'var(--info)' }}>
                          {emp.departement.name}
                        </span>
                      ) : '— Non assigné —'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(emp)}>Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { setDeletingId(emp.id); setShowDeleteModal(true); }}>Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirmer la suppression</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <p style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.</p>
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
              <h3 className="modal-title">{editingId ? 'Modifier l\'employé' : 'Ajouter un employé'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              
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

              <div className="form-group">
                <label>Département</label>
                <select name="departement_id" className="form-control" value={form.departement_id} onChange={handleChange}>
                  <option value="">— Aucun —</option>
                  {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.departement_id && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.departement_id}</span>}
              </div>
              
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
