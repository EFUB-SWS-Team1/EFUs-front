import { useState } from "react";
import { Button } from "../../../components/common";
import styles from "./GenerationCloseModal.module.css";

export default function GenerationCreateModal({ isOpen, onClose, onSubmit }) {
  const [generationName, setGenerationName] = useState("");
  const [startDate, setStartDate] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!generationName.trim() || !startDate) return;
    
    onSubmit({ name: generationName, startDate });
    
    setGenerationName(""); 
    setStartDate("");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>다음 기수 생성</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="genName" className={styles.label}>
              기수명 *
            </label>
            <input
              id="genName"
              type="text"
              className={styles.input}
              placeholder="예) EFUB 7기"
              value={generationName}
              onChange={(e) => setGenerationName(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.inputGroup} style={{ marginTop: "16px" }}>
            <label htmlFor="startDate" className={styles.label}>
              시작일 *
            </label>
            <input
              id="startDate"
              type="date"
              className={styles.input}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button variant="secondary" onClick={onClose} type="button">
              취소
            </Button>
            <Button variant="primary" type="submit" disabled={!generationName.trim() || !startDate}>
              생성
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}