import styles from './Button.module.css';

const VARIANTS = {
  primary: styles.primary,     // 거래등록, 전체1
  secondary: styles.secondary, // 뒤로가기, 전체2
};

export default function Button({
  variant = 'primary',
  children,
  icon,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const classes = [
    styles.button,
    VARIANTS[variant] ?? VARIANTS.primary,
    fullWidth ? styles.fullWidth : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}