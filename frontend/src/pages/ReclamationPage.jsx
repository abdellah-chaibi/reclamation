import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reclamationService, departementService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { title: '', content: '', latitude: '', longitude: '', departement_id: '', media: null };

export default function ReclamationPage() {
  const { user } = useAuth();
  const [reclamations, setReclamations] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setLoadingList(true);
    try {
      const [rRes, dRes] = await Promise.all([
        reclamationService.getAll(),
        departementService.getAll(),
      ]);
      // filter own
      const all = rRes.data?.data || rRes.data || [];
      setReclamations(Array.isArray(all) ? all.filter(r => r.user_id === user?.id) : []);
      const depts = dRes.data?.data || dRes.data || [];
      setDepartements(Array.isArray(depts) ? depts : []);
    } catch { setErrorMsg('Échec du chargement des données.'); }
    finally { setLoadingList(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleFileChange = (e) => {
    setForm(p => ({ ...p, media: e.target.files[0] }));
    setErrors(p => ({ ...p, media: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Le titre est requis.';
    if (!form.content.trim()) errs.content = 'La description est requise.';
    if (!form.departement_id) errs.departement_id = 'Veuillez sélectionner un département.';
    if (!form.latitude || isNaN(parseFloat(form.latitude))) errs.latitude = 'La latitude est requise (nombre valide).';
    if (!form.longitude || isNaN(parseFloat(form.longitude))) errs.longitude = 'La longitude est requise (nombre valide).';
    if (!form.media) errs.media = 'Un fichier média ou photo est requis.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('departement_id', form.departement_id);
      formData.append('latitude', parseFloat(form.latitude));
      formData.append('longitude', parseFloat(form.longitude));
      formData.append('user_id', user.id);
      if (form.media) {
        formData.append('media[]', form.media);
      }

      await reclamationService.createWithMedia(formData);
      setSuccessMsg('Réclamation soumise avec succès !');
      setForm(emptyForm);
      // Reset file input
      const fileInput = document.getElementById('mediaInput');
      if (fileInput) fileInput.value = '';
      setShowForm(false);
      fetchData();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) {
        const mapped = {};
        Object.keys(msgs).forEach(k => { mapped[k] = msgs[k][0]; });
        setErrors(mapped);
      } else {
        setErrorMsg(err?.response?.data?.message || 'Échec de la soumission de la réclamation.');
      }
    } finally { setSubmitting(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setErrorMsg('La géolocalisation n\'est pas supportée.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })),
      () => setErrorMsg('Impossible d\'obtenir la localisation.'),
    );
  };

  return (
    <div className="page-wrapper fade-up">
      <div className="section-header">
        <h2 className="section-title">📋 Mes Réclamations</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(o => !o)}>
          {showForm ? '✕ Annuler' : '＋ Nouvelle Réclamation'}
        </button>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {errorMsg   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{errorMsg}</div>}

      {/* New Reclamation Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Soumettre une Nouvelle Réclamation</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Titre *</label>
              <input name="title" className="form-control" placeholder="Brève description du problème" value={form.title} onChange={handleChange} />
              {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.title}</span>}
            </div>
            <div className="form-group">
              <label>Contenu / Description *</label>
              <textarea name="content" className="form-control" placeholder="Explication détaillée du problème..." value={form.content} onChange={handleChange} rows={4} />
              {errors.content && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.content}</span>}
            </div>
            <div className="form-group">
              <label>Département *</label>
              <select name="departement_id" className="form-control" value={form.departement_id} onChange={handleChange}>
                <option value="">— Sélectionnez un département —</option>
                {departements.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.departement_id && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.departement_id}</span>}
            </div>
            
            <div className="form-group">
              <label>Photo ou Fichier (Requis) *</label>
              <input id="mediaInput" name="media" type="file" className="form-control" onChange={handleFileChange} accept="image/*,application/pdf,video/*" />
              {errors.media && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.media}</span>}
              <small style={{ color: 'var(--text-muted)' }}>Veuillez joindre une preuve (image ou document) illustrant la réclamation.</small>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>Latitude *</label>
                <input name="latitude" className="form-control" placeholder="Ex: 33.5731" value={form.latitude} onChange={handleChange} />
                {errors.latitude && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.latitude}</span>}
              </div>
              <div className="form-group">
                <label>Longitude *</label>
                <input name="longitude" className="form-control" placeholder="Ex: -7.5898" value={form.longitude} onChange={handleChange} />
                {errors.longitude && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.longitude}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={useMyLocation}>📍 Utiliser ma position</button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Soumission…' : '📤 Soumettre la réclamation'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setErrors({}); }}>Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loadingList ? <LoadingSpinner /> : (
        reclamations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Aucune réclamation pour le moment</h3>
            <p>Cliquez sur "＋ Nouvelle Réclamation" pour soumettre votre première réclamation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reclamations.map(r => (
              <div key={r.id} className="card card-sm" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontWeight: 700 }}>{r.title}</h4>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.content && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>{r.content}</p>}
                  
                  {/* Media attachments */}
                  {r.medias && r.medias.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      {r.medias.map(m => (
                        <a 
                          key={m.id} 
                          href={`http://localhost:8000/storage/${m.path}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-sm btn-ghost" 
                          style={{ border: '1px solid var(--border)' }}
                        >
                          📎 Voir la pièce jointe
                        </a>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    <span>🏢 Dép: {r.departement?.name || `#${r.departement_id}`}</span>
                    {r.latitude && <span>📍 {r.latitude}, {r.longitude}</span>}
                    <span>📅 {new Date(r.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
