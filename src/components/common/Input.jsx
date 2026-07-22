import styles from './Input.module.css';

export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}) {
  const inputId = id ?? (label ? label.replace(/\s/g, '-') : undefined);

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[styles.input, error ? styles.error : '', className]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}