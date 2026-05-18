import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import Button from '../../components/Button/Button';
import './ForgotPassword.css';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-card">
          <h1 className="forgot-password-logo">CineMatch</h1>
          <h2 className="forgot-password-title">Kolla din e-post</h2>
          <p className="forgot-password-info">
            Om ett konto med <strong>{email}</strong> finns har en återställningslänk skickats.
          </p>
          <div className="forgot-password-footer">
            <Link to="/login">Tillbaka till inloggning</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h1 className="forgot-password-logo">CineMatch</h1>
        <h2 className="forgot-password-title">Glömt lösenord</h2>
        <p className="forgot-password-info">
          Ange din e-post så skickar vi en återställningslänk.
        </p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Skickar...' : 'Skicka återställningslänk'}
          </Button>
        </form>

        <div className="forgot-password-footer">
          <Link to="/login">Tillbaka till inloggning</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
