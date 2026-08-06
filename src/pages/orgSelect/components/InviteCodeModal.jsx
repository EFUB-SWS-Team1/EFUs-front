import { useEffect, useState } from "react";
import modalStyles from "./orgSelectModal.module.css";
import { getInviteCodes } from "../../../api/invitation/invitation";

export default function InviteCodeModal({ isOpen, onClose, onSubmit }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCode("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      await onSubmit(code);
      setCode("");
    } catch (err) {
      setError(err.message ?? "오류가 발생했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={modalStyles.overlay} onClick={handleClose}>
      <div className={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={modalStyles.title}>초대 코드 입력</h2>
        <p className={modalStyles.description}>
          단체에서 받은 초대 코드를 입력하세요
        </p>

        <input
          type="text"
          className={[modalStyles.input, error ? modalStyles.inputError : ""]
            .filter(Boolean)
            .join(" ")}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="초대 코드"
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
            disabled={isSubmitting}
          >
            입장
          </button>
        </div>
      </div>
    </div>
  );
}