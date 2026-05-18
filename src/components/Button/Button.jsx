import './Button.css';

function Button({ children, variant = 'primary', type = 'button', disabled, onClick, fullWidth = false }) {
  return (
    <button
      type={type}
      className={`btn btn--${variant}${fullWidth ? ' btn--full' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
