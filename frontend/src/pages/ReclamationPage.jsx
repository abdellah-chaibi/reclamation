import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reclamationService, departementService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const emptyForm = { title: '', content: '', latitude: '', longitude: '', departement_id: '' };

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
    } catch { setErrorMsg('Failed to load data.'); }
    finally { setLoadingList(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.departement_id) errs.departement_id = 'Please select a department.';
    if (form.latitude && isNaN(parseFloat(form.latitude))) errs.latitude = 'Must be a valid number.';
    if (form.longitude && isNaN(parseFloat(form.longitude))) errs.longitude = 'Must be a valid number.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await reclamationService.create({
        ...form,
        user_id: user.id,
        latitude: parseFloat(form.latitude) || 0,
        longitude: parseFloat(form.longitude) || 0,
      });
      setSuccessMsg('Reclamation submitted successfully!');
      setForm(emptyForm);
      setShowForm(false);
      fetchData();
    } catch (err) {
      const msgs = err?.response?.data?.errors;
      if (msgs) {
        const mapped = {};
        Object.keys(msgs).forEach(k => { mapped[k] = msgs[k][0]; });
        setErrors(mapped);
      } else {
        setErrorMsg(err?.response?.data?.message || 'Failed to submit reclamation.');
      }
    } finally { setSubmitting(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setErrorMsg('Geolocation not supported.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(p => ({ ...p, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })),
      () => setErrorMsg('Could not get location.'),
    );
  };

  return (
    <div className="page-wrapper fade-up">
      <div className="section-header">
        <h2 className="section-title">📋 My Reclamations</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(o => !o)}>
          {showForm ? '✕ Cancel' : '＋ New Reclamation'}
        </button>
      </div>

      {successMsg && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{successMsg}</div>}
      {errorMsg   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{errorMsg}</div>}

      {/* New Reclamation Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Submit New Reclamation</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Title *</label>
              <input name="title" className="form-control" placeholder="Brief description of the issue" value={form.title} onChange={handleChange} />
              {errors.title && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.title}</span>}
            </div>
            <div className="form-group">
              <label>Content / Description</label>
              <textarea name="content" className="form-control" placeholder="Detailed explanation of the problem..." value={form.content} onChange={handleChange} rows={4} />
            </div>
            <div className="form-group">
              <label>Department *</label>
              <select name="departement_id" className="form-control" value={form.departement_id} onChange={handleChange}>
                <option value="">— Select a department —</option>
                {departements.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.departement_id && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.departement_id}</span>}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Latitude</label>
                <input name="latitude" className="form-control" placeholder="e.g. 33.5731" value={form.latitude} onChange={handleChange} />
                {errors.latitude && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.latitude}</span>}
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input name="longitude" className="form-control" placeholder="e.g. -7.5898" value={form.longitude} onChange={handleChange} />
                {errors.longitude && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{errors.longitude}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={useMyLocation}>📍 Use My Location</button>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? '⏳ Submitting…' : '📤 Submit Reclamation'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loadingList ? <LoadingSpinner /> : (
        reclamations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>No reclamations yet</h3>
            <p>Click "＋ New Reclamation" to submit your first one.</p>
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
                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                    <span>🏢 Dept ID: {r.departement_id}</span>
                    {r.latitude && <span>📍 {r.latitude}, {r.longitude}</span>}
                    <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
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
