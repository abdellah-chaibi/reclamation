import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

// ─── Field must be defined OUTSIDE the parent component ──────────────────────
// If defined inside Register(), React sees a brand-new component type on every
// render (every keystroke), tears down the old input (unmount), and mounts a
// new one — stealing focus. Defining it here gives it a stable identity.
function Field({ name, label, type = 'text', placeholder, value, onChange, error }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
      {error && <span style={{ color: 'var(--danger)', fontSize: '0.78rem' }}>{error}</span>}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    // Clear field-level error as the user types
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                             errs.name = 'Name is required.';
    if (!form.email)                                   errs.email = 'Email is required.';
    if (form.password.length < 8)                      errs.password = 'Password must be at least 8 characters.';
    if (form.password !== form.password_confirmation)  errs.password_confirmation = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/home', { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        // Map Laravel field-level validation errors
        const mapped = {};
        Object.keys(data.errors).forEach(k => { mapped[k] = data.errors[k][0]; });
        setErrors(mapped);
      } else {
        setServerError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">📝</div>
          <h1>Create Account</h1>
          <p>Join the platform as a citizen</p>
        </div>

        {serverError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field
            name="name"
            label="Full Name"
            placeholder="Your full name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />
          <Field
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Field
            name="password"
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Field
            name="password_confirmation"
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            value={form.password_confirmation}
            onChange={handleChange}
            error={errors.password_confirmation}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? '⏳ Creating account…' : '🚀 Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in →</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
          <Link to="/">← Back to Welcome</Link>
        </div>
      </div>
    </div>
  );
}
