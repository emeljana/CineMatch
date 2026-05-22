import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { useToast } from '../../context/toastContext';
import { parseError } from '../../helpers/errorHelpers';
import Button from '../../components/Button/Button';

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

  const cardClass = 'bg-surface border border-border rounded-lg p-10 w-full max-w-[420px] shadow-lg max-[480px]:p-7 max-[480px]:px-5 max-[480px]:shadow-none';

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-bg">
        <div className={cardClass}>
          <h1 className="text-[28px] font-bold text-accent text-center mb-4">CineMatch</h1>
          <p className="text-sm text-dislike bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-sm px-3.5 py-2.5 mb-4">
            Ogiltig eller saknad återställningslänk.
          </p>
          <div className="text-center text-sm text-muted">
            <Link to="/forgot-password">Begär en ny länk</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg max-[480px]:items-start max-[480px]:p-4">
      <div className={cardClass}>
        <h1 className="text-[28px] font-bold text-accent text-center mb-2">CineMatch</h1>
        <h2 className="text-lg font-semibold text-center mb-6">Nytt lösenord</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="new-password" className="text-sm font-medium text-muted">Nytt lösenord</label>
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
              className={`py-2.5 px-3.5 bg-surface-2 border rounded-md text-foreground text-[15px] font-sans outline-none transition-[border-color] duration-150 focus:border-accent disabled:opacity-60 ${validationError ? 'border-dislike' : 'border-border'}`}
            />
            {validationError && (
              <p id="new-password-error" className="text-dislike text-[13px]">{validationError}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Sparar...' : 'Spara nytt lösenord'}
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          <Link to="/login">Tillbaka till inloggning</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
