import styles from './GenerationItem.module.css';

export default function GenerationItem({
  label,
  logo,
  isActive = false,
  onClick,
}) {
  return (
    <li>
      <button
        type="button"

        className={[styles.item, isActive ? styles.active : '']
          .filter(Boolean)
          .join(' ')}
        onClick={onClick}
      >
        {logo && <img src={logo} alt="" className={styles.logo} />}
        <span className={styles.label}>{label}</span>
      </button>
    </li>
  );
}