const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-[4px]',
};

function LoadingSpinner({ size = 'md', label }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${SIZE_CLASSES[size]} rounded-full border-border border-t-accent shrink-0 animate-[spin_0.7s_linear_infinite]`}
        role="status"
        aria-label={label ?? 'Laddar...'}
      />
      {label && <p className="text-sm text-muted">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;
