import { useEffect, useState } from "react";
import { Button } from "../../../components/common";
import styles from "../../groupManage/components/GenerationCloseModal.module.css";

export default function TermEditModal({
  isOpen,
  currentName,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}) {
  const [termName, setTermName] = useState(currentName);

  useEffect(() => {
    if (isOpen) setTermName(currentName ?? "");
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const nextName = termName.trim();
    if (!nextName || isSubmitting) return;
    onSubmit(nextName);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>기수명 수정</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="termName" className={styles.label}>
              기수명 *
            </label>
            <input
              id="termName"
              type="text"
              className={styles.input}
              placeholder="예) 7기"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              autoFocus
            />
          </div>

          {errorMessage && <p className={styles.notice}>{errorMessage}</p>}

          <div className={styles.buttonGroup}>
            <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!termName.trim() || termName.trim() === currentName || isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}