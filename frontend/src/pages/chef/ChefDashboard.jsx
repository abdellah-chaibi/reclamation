import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reclamationService, userService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUSES = [
  { value: 'en_attent', label: 'En Attente' },
  { value: 'en_cours',  label: 'En Cours' },
  { value: 'traite',    label: 'Traitée' },
  { value: 'rejete',    label: 'Rejetée' },
];

const emptyEmpForm = { name: '', email: '', password: '', role: 'employe', cin: '' };

export default function ChefDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reclamations'); // 'reclamations' | 'employes'
  
  const [recs, setRecs]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(true);
  
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  
  // Reclamation action state
  const [actionRow, setActionRow] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [saving, setSaving]     = useState(false);

  // Employee modal state
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [showDelEmpModal, setShowDelEmpModal] = useState(false);
  const [empForm, setEmpForm] = useState(emptyEmpForm);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [deletingEmpId, setDeletingEmpId] = useState(null);
  const [empErrors, setEmpErrors] = useState({});
  const [empSaving, setEmpSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, uRes] = await Promise.all([reclamationService.getAll(), userService.getAll()]);
      const r = rRes.data?.data || rRes.data || [];
      const myDeptId = user?.departement_id;
      setRecs(Array.isArray(r) ? r.filter(x => x.departement_id === myDeptId) : []);
      
      const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setEmployees(u.filter(x => x.role === 'employe' && x.departement_id === myDeptId));
    } catch { setError('Échec du chargement des données.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // --- Reclamations Actions ---
  const openAction = (rec) => {
    setActionRow(rec.id);
    setAssignEmpId(String(rec.assigned_to || ''));
    setUpdateStatus(rec.status);
    setError(''); setSuccess('');
  };

  const handleSaveRec = async (recId) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {};
      if (updateStatus) payload.status = updateStatus;
      if (assignEmpId) payload.assigned_to = parseInt(assignEmpId);
      await reclamationService.update(recId, payload);
      setSuccess('Réclamation mise à jour avec succès.');
      setActionRow(null); fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Échec de la mise à jour de la réclamation.');
    } finally { setSaving(false); }
  };

  // --- Employee Actions ---
  const handleEmpChange = (e) => {
    setEmpForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setEmpErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const openCreateEmp = () => {
    setEmpForm(emptyEmpForm);
    setEditingEmpId(null);
    setEmpErrors({}); setError(''); setSuccess('');
    setShowEmpModal(true);
  };

  const openEditEmp = (emp) => {
    setEmpForm({
      name: emp.name,
      email: emp.email,
      password: '',
      role: 'employe',
      cin: emp.cin || ''
    });
    setEditingEmpId(emp.id);
    setEmpErrors({}); setError(''); setSuccess('');
    setShowEmpModal(true);
  };

  const handleSaveEmp = async (e) => {
    e.preventDefault();
    setEmpSaving(true); setError(''); setSuccess('');
    try {
      const payload = { ...empForm, departement_id: user.departement_id };
      if (editingEmpId && !payload.password) delete payload.password;

      if (editingEmpId) {
        await userService.update(editingEmpId, payload);
        setSuccess('Employé mis à jour avec succès.');
      } else {
        await userService.create(payload);
        setSuccess('Employé créé avec succès.');
      }
      setShowEmpModal(false);
      fetchAll();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) { 
        const m = {}; Object.keys(msgs).forEach(k => m[k] = msgs[k][0]); setEmpErrors(m); 
      }
      else setError(err?.response?.data?.message || 'Échec de la sauvegarde de l\'employé.');
    } finally { setEmpSaving(false); }
  };

  const confirmDeleteEmp = async () => {
    if (!deletingEmpId) return;
    try {
      await userService.delete(deletingEmpId);
      setSuccess('Employé supprimé avec succès.');
      setShowDelEmpModal(false);
      fetchAll();
    } catch { setError('Échec de la suppression de l\'employé.'); setShowDelEmpModal(false); }
  };

  // Stats
  const pending = recs.filter(r => r.status === 'en_attent').length;
  const inProg  = recs.filter(r => r.status === 'en_cours').length;
  const done    = recs.filter(r => r.status === 'traite').length;

  return (
    <div className="page-wrapper fade-up">
      <div className="section-header">
        <h2 className="section-title">📊 Tableau de Bord (Chef de Service)</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Dép : <strong>{user?.departement?.name || `#${user?.departement_id}`}</strong>
        </span>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'reclamations' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => { setActiveTab('reclamations'); setError(''); setSuccess(''); }}
        >
          📋 Réclamations du Département
        </button>
        <button 
          className={`btn ${activeTab === 'employes' ? 'btn-primary' : 'btn-ghost'}`} 
          onClick={() => { setActiveTab('employes'); setError(''); setSuccess(''); }}
        >
          👷 Gestion des Employés
        </button>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {activeTab === 'reclamations' && (
        <>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-warning">⏳</div>
              <div><div className="stat-number">{pending}</div><div className="stat-label">En Attente</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-info">🔄</div>
              <div><div className="stat-number">{inProg}</div><div className="stat-label">En Cours</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-success">✅</div>
              <div><div className="stat-number">{done}</div><div className="stat-label">Traitées</div></div>
            </div>
          </div>

          {loading ? <LoadingSpinner /> : (
            recs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>Aucune réclamation assignée à votre département pour le moment.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recs.map(r => (
                  <div key={r.id} className="card card-sm">
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{r.title}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        {r.content && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{r.content}</p>}
                        
                        {r.medias && r.medias.length > 0 && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                            {r.medias.map(m => (
                              <a key={m.id} href={`http://localhost:8000/storage/${m.path}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-ghost" style={{ border: '1px solid var(--border)' }}>
                                📎 Voir P.J.
                              </a>
                            ))}
                          </div>
                        )}

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          <span>👤 Citoyen #{r.user_id}</span>
                          <span>📅 Déposé le : {new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                          {r.assigned_to && <span>👷 Assigné à : {employees.find(e => e.id === r.assigned_to)?.name || `#${r.assigned_to}`}</span>}
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => actionRow === r.id ? setActionRow(null) : openAction(r)}>
                        {actionRow === r.id ? '✕ Fermer' : '✏️ Gérer'}
                      </button>
                    </div>

                    {actionRow === r.id && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ minWidth: 200 }}>
                          <label>Assigner à un Employé</label>
                          <select className="form-control" value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)}>
                            <option value="">— Non Assigné —</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group" style={{ minWidth: 160 }}>
                          <label>Changer le Statut</label>
                          <select className="form-control" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => handleSaveRec(r.id)} disabled={saving}>
                          {saving ? 'Sauvegarde…' : '💾 Sauvegarder'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {activeTab === 'employes' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Gérez les employés affectés à votre département.</p>
            <button className="btn btn-primary btn-sm" onClick={openCreateEmp}>＋ Ajouter un Employé</button>
          </div>

          {loading ? <LoadingSpinner /> : (
            employees.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👷</div>
                <p>Aucun employé dans ce département.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr><th>#</th><th>Nom</th><th>Email</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td style={{ color: 'var(--text-muted)' }}>#{emp.id}</td>
                        <td><strong>{emp.name}</strong></td>
                        <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditEmp(emp)}>Modifier</button>
                            <button className="btn btn-danger btn-sm" onClick={() => { setDeletingEmpId(emp.id); setShowDelEmpModal(true); }}>Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Delete Employee Modal */}
          {showDelEmpModal && (
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowDelEmpModal(false)}>
              <div className="modal" style={{ maxWidth: 400 }}>
                <div className="modal-header">
                  <h3 className="modal-title">Confirmer la suppression</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowDelEmpModal(false)}>✕</button>
                </div>
                <p style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>Êtes-vous sûr de vouloir supprimer cet employé ?</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setShowDelEmpModal(false)}>Annuler</button>
                  <button className="btn btn-danger" onClick={confirmDeleteEmp}>Supprimer</button>
                </div>
              </div>
            </div>
          )}

          {/* Create / Edit Employee Modal */}
          {showEmpModal && (
            <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowEmpModal(false)}>
              <div className="modal">
                <div className="modal-header">
                  <h3 className="modal-title">{editingEmpId ? 'Modifier l\'employé' : 'Ajouter un employé'}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowEmpModal(false)}>✕</button>
                </div>
                <form onSubmit={handleSaveEmp} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  
                  {[{ name: 'name', label: 'Nom complet', placeholder: 'Nom et prénom' },
                    { name: 'email', label: 'Email', type: 'email', placeholder: 'email@exemple.com' },
                    { name: 'password', label: editingEmpId ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe', type: 'password', placeholder: 'Min 6 caractères' },
                  ].map(f => (
                    <div className="form-group" key={f.name}>
                      <label>{f.label}</label>
                      <input name={f.name} type={f.type || 'text'} className="form-control" placeholder={f.placeholder} value={empForm[f.name]} onChange={handleEmpChange} />
                      {empErrors[f.name] && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{empErrors[f.name]}</span>}
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={empSaving}>{empSaving ? 'Enregistrement…' : 'Enregistrer'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEmpModal(false)}>Annuler</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
