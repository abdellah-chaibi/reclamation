import { Link } from 'react-router-dom';
import '../App.css';

export default function Welcome() {
  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <div className="welcome-logo">🏛️</div>
        <h1 className="welcome-title">Reclamation Management Platform</h1>
        <p className="welcome-subtitle">
          A modern platform to submit, track, and manage civic reclamations. Connect citizens
          with departments and ensure every complaint gets resolved efficiently.
        </p>

        <div className="welcome-actions">
          <Link to="/login" className="btn btn-primary btn-lg">
            🔑 Sign In
          </Link>
          <Link to="/register" className="btn btn-secondary btn-lg">
            📝 Create Account
          </Link>
        </div>

        <div className="welcome-features">
          <div className="welcome-feature">
            <span className="welcome-feature-icon">📋</span>
            <span>Submit Reclamations</span>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">🔍</span>
            <span>Track Progress</span>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">⚡</span>
            <span>Fast Resolution</span>
          </div>
          <div className="welcome-feature">
            <span className="welcome-feature-icon">🔒</span>
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
}
