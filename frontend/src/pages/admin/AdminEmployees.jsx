import { useState, useEffect } from 'react';
import { userService, departementService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [editId, setEditId]       = useState(null);
  const [editDept, setEditDept]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [success, setSuccess]     = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([userService.getAll(), departementService.getAll()]);
      const u = Array.isArray(uRes.data) ? uRes.data : (uRes.data?.data || []);
      setEmployees(u.filter(x => x.role === 'employe'));
      const d = dRes.data?.data || dRes.data || [];
      setDepts(Array.isArray(d) ? d : []);
    } catch { setError('Failed to load employees.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async (id) => {
    if (!editDept) { setError('Please select a department.'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      await userService.update(id, { departement_id: parseInt(editDept) });
      setSuccess('Department assigned successfully.');
      setEditId(null); fetchAll();
    } catch { setError('Failed to assign department.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fade-up">
      <div className="section-header">
        <h2 className="section-title">🔧 Employees</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{employees.length} employees</span>
      </div>

      {error   && <div className="alert alert-error"   style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

      {loading ? <LoadingSpinner /> : (
        employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👷</div>
            <p>No employees found. Create users with the Employee role.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Current Dept</th><th>Assign Department</th></tr></thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ color: 'var(--text-muted)' }}>#{emp.id}</td>
                    <td><strong>{emp.name}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{emp.email}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{emp.departement?.name || '— Unassigned —'}</td>
                    <td>
                      {editId === emp.id ? (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <select className="form-control" style={{ width: 150, padding: '0.3rem' }} value={editDept} onChange={(e) => setEditDept(e.target.value)}>
                            <option value="">— Select —</option>
                            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <button className="btn btn-success btn-sm" onClick={() => handleAssign(emp.id)} disabled={saving}>✓</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditId(emp.id); setEditDept(String(emp.departement_id || '')); }}>
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
