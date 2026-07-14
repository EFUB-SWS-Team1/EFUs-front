import { useState } from 'react';
import styles from './EventAddModal.module.css';

function EventAddModal({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSave = () => {
    if (!name.trim()) return alert('행사명을 입력해주세요.');
    if (!budget) return alert('예산을 입력해주세요.');
    onSave({
      name,
      budget: Number(budget),
      startDate: startDate || null,
      endDate: endDate || null,
      participants: 0,
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>행사 추가</h2>

        <div className={styles.field}>
          <label className={styles.label}>행사명 *</label>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="행사명을 입력하세요"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>예산 *</label>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="금액 입력"
            />
            <span className={styles.unit}>원</span>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>날짜</label>
          <div className={styles.dateRow}>
            <input
              className={styles.input}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span>~</span>
            <input
              className={styles.input}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
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

export default EventAddModal;