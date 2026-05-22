const VARIANT_LABELS = {
  error: 'Error',
  success: 'Success',
  info: 'Info',
};

const VARIANT_CLASSES = {
  error:   { accent: 'text-dislike',     border: 'border-[rgba(239,68,68,0.45)] border-l-dislike' },
  success: { accent: 'text-like',        border: 'border-[rgba(34,197,94,0.45)] border-l-like' },
  info:    { accent: 'text-[#38bdf8]',   border: 'border-[rgba(56,189,248,0.45)] border-l-[#38bdf8]' },
};

function Toast({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed right-6 bottom-6 z-[1000] flex flex-col gap-3 w-[min(360px,calc(100vw-32px))] pointer-events-none max-sm:right-4 max-sm:bottom-4 max-sm:left-4 max-sm:w-auto"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(({ id, message, variant }) => {
        const { accent, border } = VARIANT_CLASSES[variant];
        return (
          <div
            key={id}
            className={`grid grid-cols-[1fr_auto] gap-4 items-start pt-[14px] pr-[14px] pb-[14px] pl-4 border border-l-4 rounded-md bg-[rgba(26,27,37,0.96)] shadow-lg text-foreground pointer-events-auto ${border}`}
            role={variant === 'error' ? 'alert' : 'status'}
            aria-live={variant === 'error' ? 'assertive' : 'polite'}
          >
            <div className="min-w-0">
              <span className={`block mb-0.5 text-[13px] font-bold ${accent}`}>
                {VARIANT_LABELS[variant]}
              </span>
              <p className="text-foreground text-sm leading-[1.4] break-words">{message}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center w-7 h-7 border border-transparent rounded-sm bg-transparent text-muted font-[inherit] text-lg leading-none cursor-pointer hover:border-border hover:text-foreground focus-visible:border-border focus-visible:text-foreground"
              onClick={() => onClose(id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toast;
