import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reclamationService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [recs, setRecs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await reclamationService.getAll();
      const r = res.data?.data || res.data || [];
      // Show reclamations in employee's department that are assigned to them
      const myDeptId = user?.departement_id;
      setRecs(Array.isArray(r) ? r.filter(x => x.departement_id === myDeptId) : []);
    } catch { setError('Failed to load assigned reclamations.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await reclamationService.update(id, { status: newStatus });
      setSuccess(`Status updated to "${newStatus}".`);
      setUpdatingId(null); fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally { setSaving(false); }
  };

  const todo    = recs.filter(r => r.status === 'en_attent' || r.status === 'en_cours');
  const resolved = recs.filter(r => r.status === 'traite' || r.status === 'rejete');

  return (
    <div className="page-wrapper fade-up">
      <div className="section-header">
        <h2 className="section-title">🔧 My Assigned Tasks</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {recs.length} reclamation(s) in your department
        </span>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">📋</div>
          <div><div className="stat-number">{todo.length}</div><div className="stat-label">To Handle</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">✅</div>
          <div><div className="stat-number">{resolved.length}</div><div className="stat-label">Resolved</div></div>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        recs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>All clear!</h3>
            <p>No reclamations in your department currently.</p>
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
                    {r.content && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', lineHeight: 1.5 }}>{r.content}</p>}
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
                      {r.latitude && <span>📍 {r.latitude}, {r.longitude}</span>}
                    </div>
                  </div>
                  {r.status !== 'traite' && r.status !== 'rejete' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate(r.id, 'traite')}
                        disabled={saving}
                        title="Mark as done"
                      >
                        ✅ Done
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusUpdate(r.id, 'en_cours')}
                        disabled={saving || r.status === 'en_cours'}
                        title="Mark as in progress"
                      >
                        🔄 In Progress
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
