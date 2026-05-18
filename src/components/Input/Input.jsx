import './Input.css';

function Input({
  id,
  type,
  value,
  onChange,
  label,
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
        {...inputProps}
      />
    </div>
  );
}

export default Input;
