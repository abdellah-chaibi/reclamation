export default function About() {
  const features = [
    { icon: '📋', title: 'Easy Submission', desc: 'Citizens can submit reclamations with location data and full details in minutes.' },
    { icon: '🏢', title: 'Department Routing', desc: 'Reclamations are automatically routed to the responsible department for handling.' },
    { icon: '🔄', title: 'Status Tracking', desc: 'Real-time status updates from "En Attente" all the way to "Traité".' },
    { icon: '👥', title: 'Team Collaboration', desc: 'Chefs de service assign tasks to employees and monitor progress effectively.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'All data is secured with token-based authentication and role-based access control.' },
    { icon: '📍', title: 'Location-Aware', desc: 'GPS coordinates help departments pinpoint issues on the ground quickly.' },
  ];

  return (
    <div className="page-wrapper fade-up">
      {/* Hero */}
      <div className="card" style={{ textAlign: 'center', marginBottom: '2rem', background: 'linear-gradient(135deg, var(--bg-card), rgba(99,102,241,0.08))', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏛️</div>
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>About ReclamApp</h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 600, margin: '0 auto', lineHeight: 1.8, fontSize: '0.95rem' }}>
          ReclamApp is a civic platform designed to bridge the gap between citizens and local government departments.
          Our mission is to make reclamation management transparent, efficient, and accessible to everyone.
        </p>
      </div>

      {/* Features */}
      <div className="section-header">
        <h2 className="section-title">What We Offer</h2>
      </div>
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {features.map(f => (
          <div key={f.title} className="card card-sm" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>{f.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Roles */}
      <div className="section-header">
        <h2 className="section-title">User Roles</h2>
      </div>
      <div className="grid-2">
        {[
          { role: 'citoyen', label: 'Citizen', icon: '👤', desc: 'Submit and track personal reclamations from any location.' },
          { role: 'employe', label: 'Employee', icon: '🔧', desc: 'Handle reclamations assigned by the Chef de service.' },
          { role: 'chef_dep', label: 'Chef Service', icon: '📊', desc: 'Assign reclamations, manage employees, update statuses.' },
          { role: 'admin', label: 'Administrator', icon: '⚙️', desc: 'Full platform management: users, departments, reclamations.' },
        ].map(r => (
          <div key={r.role} className="card card-sm" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="stat-icon stat-icon-primary" style={{ fontSize: '1.4rem', flexShrink: 0 }}>{r.icon}</div>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: 700 }}>{r.label}</span>
                <span className={`badge badge-role-${r.role}`}>{r.label}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.6 }}>{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>Made with ❤️ for better civic engagement. Version 1.0.0 &mdash; 2026</p>
      </div>
    </div>
  );
}
