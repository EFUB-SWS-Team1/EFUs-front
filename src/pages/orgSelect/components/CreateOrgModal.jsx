import { useCallback, useEffect, useState } from "react";
import modalStyles from "./orgSelectModal.module.css";

export default function CreateOrgModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = name.trim().length > 0;

  const handleClose = useCallback(() => {
    setName("");
    setError("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit({ name: name.trim() });
      setName("");
    } catch (err) {
      setError(err.message ?? "오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={modalStyles.overlay} onClick={handleClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>단체 생성</h2>

        <label className={modalStyles.fieldLabel} htmlFor="org-name">
          단체명 <span className={modalStyles.required}>*</span>
        </label>

        <input
          id="org-name"
          type="text"
          className={[modalStyles.input, error ? modalStyles.inputError : ""]
            .filter(Boolean)
            .join(" ")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder=""
        />
        {error && <p className={modalStyles.errorText}>{error}</p>}

        <div className={modalStyles.actions}>
          <button type="button" className={modalStyles.cancelBtn} onClick={handleClose}>
            취소
          </button>
          <button
            type="button"
            className={modalStyles.primaryBtn}
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
