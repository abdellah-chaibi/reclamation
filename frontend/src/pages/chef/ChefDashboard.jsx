import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reclamationService, userService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

const STATUSES = [
  { value: 'en_attent', label: 'En Attente' },
  { value: 'en_cours',  label: 'En Cours' },
  { value: 'traite',    label: 'Traité' },
  { value: 'rejete',    label: 'Rejeté' },
];

export default function ChefDashboard() {
  const { user } = useAuth();
  const [recs, setRecs]         = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [actionRow, setActionRow] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [saving, setSaving]     = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rRes, uRes] = await Promise.all([reclamationService.getAll(), userService.getAll()]);
      const r = rRes.data?.data || rRes.data || [];
      // Filter reclamations belonging to chef's department
      const myDeptId = user?.departement_id;
      setRecs(Array.isArray(r) ? r.filter(x => x.departement_id === myDeptId) : []);
      const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setEmployees(u.filter(x => x.role === 'employe' && x.departement_id === myDeptId));
    } catch { setError('Failed to load dashboard data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAction = (rec) => {
    setActionRow(rec.id);
    setAssignEmpId(String(rec.assigned_to || ''));
    setUpdateStatus(rec.status);
    setError(''); setSuccess('');
  };

  const handleSave = async (recId) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {};
      if (updateStatus) payload.status = updateStatus;
      if (assignEmpId) payload.assigned_to = parseInt(assignEmpId);
      await reclamationService.update(recId, payload);
      setSuccess('Reclamation updated successfully.');
      setActionRow(null); fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update reclamation.');
    } finally { setSaving(false); }
  };

  const pending = recs.filter(r => r.status === 'en_attent').length;
  const inProg  = recs.filter(r => r.status === 'en_cours').length;
  const done    = recs.filter(r => r.status === 'traite').length;

  return (
    <div className="page-wrapper fade-up">
      <div className="section-header">
        <h2 className="section-title">📊 Chef Service Dashboard</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Dept: <strong>{user?.departement?.name || `#${user?.departement_id}`}</strong>
        </span>
      </div>

      {/* Stats */}
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">⏳</div>
          <div><div className="stat-number">{pending}</div><div className="stat-label">Pending</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">🔄</div>
          <div><div className="stat-number">{inProg}</div><div className="stat-label">In Progress</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">✅</div>
          <div><div className="stat-number">{done}</div><div className="stat-label">Resolved</div></div>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 700 }}>Department Reclamations</h3>
      </div>

      {loading ? <LoadingSpinner /> : (
        recs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No reclamations assigned to your department yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recs.map(r => (
              <div key={r.id} className="card card-sm">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700 }}>{r.title}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    {r.content && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{r.content}</p>}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>👤 User #{r.user_id}</span>
                      <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
                      {r.assigned_to && <span>🔧 Assigned to #{r.assigned_to}</span>}
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => actionRow === r.id ? setActionRow(null) : openAction(r)}>
                    {actionRow === r.id ? '✕ Close' : '✏️ Manage'}
                  </button>
                </div>

                {actionRow === r.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ minWidth: 180 }}>
                      <label>Assign to Employee</label>
                      <select className="form-control" value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)}>
                        <option value="">— None —</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ minWidth: 160 }}>
                      <label>Update Status</label>
                      <select className="form-control" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSave(r.id)} disabled={saving}>
                      {saving ? 'Saving…' : '💾 Save'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
