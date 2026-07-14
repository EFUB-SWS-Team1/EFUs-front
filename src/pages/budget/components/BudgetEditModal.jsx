import { useState } from 'react';
import styles from './BudgetEditModal.module.css';

function BudgetEditModal({ currentBudget, onSave, onCancel }) {
  const [value, setValue] = useState(currentBudget.toLocaleString());

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (!isNaN(raw)) setValue(Number(raw).toLocaleString());
  };

  const handleSave = () => {
    const raw = Number(value.replace(/,/g, ''));
    if (!raw || raw <= 0) return alert('올바른 금액을 입력해주세요.');
    onSave(raw);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>예산 수정</h2>
        <div className={styles.field}>
          <label className={styles.label}>총 예산</label>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              value={value}
              onChange={handleChange}
            />
            <span className={styles.unit}>원</span>
          </div>
        </div>
        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button className={styles.saveBtn} onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default BudgetEditModal;