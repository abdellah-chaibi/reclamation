import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reclamationService } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
      const myDeptId = user?.departement_id;
      setRecs(Array.isArray(r) ? r.filter(x => x.departement_id === myDeptId) : []);
    } catch { setError('Échec du chargement des tâches assignées.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await reclamationService.update(id, { status: newStatus });
      setSuccess(`Statut mis à jour avec succès.`);
      setUpdatingId(null); fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || 'Échec de la mise à jour du statut.');
    } finally { setSaving(false); }
  };

  const todo    = recs.filter(r => r.status === 'en_attent' || r.status === 'en_cours');
  const resolved = recs.filter(r => r.status === 'terminee' || r.status === 'rejete');

  return (
    <div className="page-wrapper fade-up">
      <div className="section-header">
        <h2 className="section-title">🔧 Mes Tâches Assignées</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {recs.length} réclamation(s) dans votre département
        </span>
      </div>

      {/* Stats */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">📋</div>
          <div><div className="stat-number">{todo.length}</div><div className="stat-label">À traiter</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success">✅</div>
          <div><div className="stat-number">{resolved.length}</div><div className="stat-label">Résolues</div></div>
        </div>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        recs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Tout est clair !</h3>
            <p>Aucune réclamation dans votre département pour le moment.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recs.map(r => (
              <div key={r.id} className="card card-sm">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{r.title}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    {r.content && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>{r.content}</p>}
                    
                    {/* Media Attachments */}
                    {r.medias && r.medias.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-subtle)', display: 'block', marginBottom: '0.5rem' }}>Pièces jointes :</span>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {r.medias.map(m => (
                            <a 
                              key={m.id} 
                              href={`http://localhost:8000/storage/${m.path}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-sm btn-ghost" 
                              style={{ border: '1px solid var(--border)', background: 'var(--surface-50)' }}
                            >
                              📎 Voir le document
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Leaflet Map Integration */}
                    {r.latitude && r.longitude && (
                      <div style={{ marginBottom: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <MapContainer 
                          center={[parseFloat(r.latitude), parseFloat(r.longitude)]} 
                          zoom={14} 
                          style={{ height: '200px', width: '100%' }}
                          scrollWheelZoom={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[parseFloat(r.latitude), parseFloat(r.longitude)]}>
                            <Popup>{r.title}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                      <span>📅 Déposé le : {new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  
                  {r.status !== 'traite' && r.status !== 'rejete' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusUpdate(r.id, 'en_cours')}
                        disabled={saving || r.status === 'en_cours'}
                        style={{ width: '100%' }}
                      >
                        🔄 En Cours
                      </button>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleStatusUpdate(r.id, 'terminee')}
                        disabled={saving}
                        style={{ width: '100%' }}
                      >
                        ✅ Traitée
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
