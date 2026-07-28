import { useEffect } from 'react';
import styles from './SuccessModal.module.css';

export default function SuccessModal({ isOpen, message, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => onClose?.(), 2500);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5L19 7"
              stroke="#5b6cf9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}