import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { useToast } from '../../context/toastContext';
import Button from '../../components/Button/Button';
import './ResetPassword.css';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

function validatePassword(password) {
  if (password.length < 8) return 'Lösenordet måste vara minst 8 tecken.';
  if (password.length > 100) return 'Lösenordet får inte vara längre än 100 tecken.';
  return null;
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const toast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    const nextError = validatePassword(newPassword);
    setValidationError(nextError);
    if (nextError) return;

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      toast.success('Password updated. You can log in now.');
      navigate('/login');
    } catch (err) {
      const message = parseError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-card">
          <h1 className="reset-password-logo">CineMatch</h1>
          <p className="form-error">Ogiltig eller saknad återställningslänk.</p>
          <div className="reset-password-footer">
            <Link to="/forgot-password">Begär en ny länk</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h1 className="reset-password-logo">CineMatch</h1>
        <h2 className="reset-password-title">Nytt lösenord</h2>

        <form onSubmit={handleSubmit} className="reset-password-form" noValidate>
          <div className="form-group">
            <label htmlFor="new-password">Nytt lösenord</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setValidationError(null);
              }}
              required
              minLength={8}
              maxLength={100}
              disabled={loading}
              autoComplete="new-password"
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? 'new-password-error' : undefined}
            />
            {validationError && (
              <p id="new-password-error" className="form-error">
                {validationError}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Sparar...' : 'Spara nytt lösenord'}
          </Button>
        </form>

        <div className="reset-password-footer">
          <Link to="/login">Tillbaka till inloggning</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
