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
<<<<<<< HEAD
        className={`${styles.item} ${isSelected ? styles.selected : ""}`}
        onClick={onClick}
      >
        {/* TODO: 디자이너 SVG 받으면 교체 */}
        <span className={styles.icon} aria-hidden="true">
          ▪▪
        </span>
        {name}
=======
        className={[styles.item, isActive ? styles.active : '']
          .filter(Boolean)
          .join(' ')}
        onClick={onClick}
      >
        {logo && <img src={logo} alt="" className={styles.logo} />}
        <span className={styles.label}>{label}</span>
>>>>>>> origin/develop
      </button>
    </li>
  );
}