import './Input.css';

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
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
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
        {...inputProps}
      />
      {error && (
        <p id={`${id}-error`} className="input-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
