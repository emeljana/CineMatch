const BASE = 'inline-flex items-center justify-center rounded-md text-[15px] font-medium font-sans cursor-pointer transition-[opacity,transform] duration-150 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const VARIANT_CLASSES = {
  primary:  'py-2.5 px-6 bg-accent text-white hover:opacity-[0.88] active:scale-[0.97]',
  secondary:'py-2.5 px-6 border border-border text-muted hover:border-muted hover:text-foreground active:scale-[0.97]',
  like:     'py-3.5 px-8 bg-like text-white text-lg hover:opacity-[0.88] active:scale-[0.97]',
  dislike:  'py-3.5 px-8 bg-dislike text-white text-lg hover:opacity-[0.88] active:scale-[0.97]',
  danger:   'py-2.5 px-6 bg-dislike text-white hover:opacity-[0.88] active:scale-[0.97]',
};

function Button({ children, variant = 'primary', type = 'button', disabled, onClick, fullWidth = false, className = '' }) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANT_CLASSES[variant]}${fullWidth ? ' w-full' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
