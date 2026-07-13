import styles from './Modal.module.css';
import Button from './Button';

function Modal({ title, children, onConfirm, onCancel, confirmText = '확인', cancelText = '취소' }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.content}>{children}</div>
        <div className={styles.buttons}>
          <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}

export default Modal;