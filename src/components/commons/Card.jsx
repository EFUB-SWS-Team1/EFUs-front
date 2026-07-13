import styles from './Card.module.css';

function Card({ children, onClick }) {
  return (
    <div className={`${styles.card} ${onClick ? styles.clickable : ''}`} onClick={onClick}>
      {children}
    </div>
  );
}

export default Card;