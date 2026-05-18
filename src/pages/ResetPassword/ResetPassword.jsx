import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import Button from '../../components/Button/Button';
import './ResetPassword.css';

function parseError(err) {
  const errors = err.response?.data;
  if (Array.isArray(errors) && errors.length > 0) return errors[0].description;
  return 'Something went wrong. Please try again.';
}

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      navigate('/login');
    } catch (err) {
      setError(parseError(err));
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

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="new-password">Nytt lösenord</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={100}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

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
