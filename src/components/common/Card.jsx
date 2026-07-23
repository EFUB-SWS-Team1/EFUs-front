import styles from './Card.module.css';

export default function Card({ title, children, className = '' }) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </div>
  );
}