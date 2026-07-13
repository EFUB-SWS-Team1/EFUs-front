import styles from './Button.module.css';

function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;