import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { useToast } from '../../context/toastContext';
import { parseError } from '../../helpers/errorHelpers';
import Button from '../../components/Button/Button';
import './ForgotPassword.css';

function validateEmail(email) {
  if (!email.trim()) return 'E-post krävs.';
  if (!email.includes('@')) return 'Ange en giltig e-postadress.';
  return null;
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const nextError = validateEmail(email);
    setValidationError(nextError);
    if (nextError) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Password reset email sent.');
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
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

        <form onSubmit={handleSubmit} className="forgot-password-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationError(null);
              }}
              required
              disabled={loading}
              autoComplete="email"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'email-error' : undefined}
            />
            {validationError && (
              <p id="email-error" className="form-error">
                {validationError}
              </p>
            )}
          </div>

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
