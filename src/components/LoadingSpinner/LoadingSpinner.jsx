import './LoadingSpinner.css';

function LoadingSpinner({ size = 'md', label }) {
  return (
    <div className="spinner-wrapper">
      <div className={`spinner spinner--${size}`} role="status" aria-label={label ?? 'Laddar...'} />
      {label && <p className="spinner-label">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
