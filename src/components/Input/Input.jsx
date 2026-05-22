function Input({
  id,
  type,
  value,
  onChange,
  label,
  error,
  disabled,
  required,
  placeholder,
  ...inputProps
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`py-2.5 px-3.5 bg-surface-2 border rounded-md text-foreground text-[15px] font-sans outline-none transition-[border-color] duration-150 focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed ${error ? 'border-dislike' : 'border-border'}`}
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="text-dislike text-[13px]">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
