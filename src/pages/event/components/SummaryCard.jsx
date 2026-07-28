import styles from './SummaryCard.module.css';

export default function SummaryCard({ label, value }) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}