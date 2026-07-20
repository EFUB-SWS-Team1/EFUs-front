import styles from "./GenerationItem.module.css";

/**
 * GenerationItem
 * GenerationSwitcher 드롭다운 안에서 기수 하나를 렌더링하는 단위.
 */
export default function GenerationItem({ name, isSelected, onClick }) {
  return (
    <li>
      <button
        type="button"
        className={`${styles.item} ${isSelected ? styles.selected : ""}`}
        onClick={onClick}
      >
        {/* TODO: 디자이너 SVG 받으면 교체 */}
        <span className={styles.icon} aria-hidden="true">
          ▪▪
        </span>
        {name}
      </button>
    </li>
  );
}