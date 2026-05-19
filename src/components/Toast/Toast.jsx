import './Toast.css';

const VARIANT_LABELS = {
  error: 'Error',
  success: 'Success',
  info: 'Info',
};

function Toast({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-region" role="region" aria-label="Notifications">
      {toasts.map(({ id, message, variant }) => (
        <div
          key={id}
          className={`toast toast--${variant}`}
          role={variant === 'error' ? 'alert' : 'status'}
          aria-live={variant === 'error' ? 'assertive' : 'polite'}
        >
          <div className="toast-content">
            <span className="toast-title">{VARIANT_LABELS[variant]}</span>
            <p className="toast-message">{message}</p>
          </div>
          <button
            type="button"
            className="toast-close"
            onClick={() => onClose(id)}
            aria-label="Close notification"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
