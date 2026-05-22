import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { useToast } from '../../context/toastContext';
import { parseError } from '../../helpers/errorHelpers';
import Button from '../../components/Button/Button';

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

  const cardClass = 'bg-surface border border-border rounded-lg p-10 w-full max-w-[420px] shadow-lg max-[480px]:p-7 max-[480px]:px-5 max-[480px]:shadow-none';

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-bg">
        <div className={cardClass}>
          <h1 className="text-[28px] font-bold text-accent text-center mb-2">CineMatch</h1>
          <h2 className="text-lg font-semibold text-center mb-4">Kolla din e-post</h2>
          <p className="text-sm text-muted text-center mb-6">
            Om ett konto med <strong className="text-foreground">{email}</strong> finns har en återställningslänk skickats.
          </p>
          <div className="text-center text-sm text-muted">
            <Link to="/login">Tillbaka till inloggning</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-bg max-[480px]:items-start max-[480px]:p-4">
      <div className={cardClass}>
        <h1 className="text-[28px] font-bold text-accent text-center mb-2">CineMatch</h1>
        <h2 className="text-lg font-semibold text-center mb-2">Glömt lösenord</h2>
        <p className="text-sm text-muted text-center mb-6">
          Ange din e-post så skickar vi en återställningslänk.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-muted">E-post</label>
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
              className={`py-2.5 px-3.5 bg-surface-2 border rounded-md text-foreground text-[15px] font-sans outline-none transition-[border-color] duration-150 focus:border-accent disabled:opacity-60 ${validationError ? 'border-dislike' : 'border-border'}`}
            />
            {validationError && (
              <p id="email-error" className="text-dislike text-[13px]">{validationError}</p>
            )}
          </div>

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Skickar...' : 'Skicka återställningslänk'}
          </Button>
        </form>

        <div className="text-center mt-6 text-sm text-muted">
          <Link to="/login">Tillbaka till inloggning</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
