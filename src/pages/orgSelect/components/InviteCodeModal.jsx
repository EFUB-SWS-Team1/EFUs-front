import { useEffect, useState } from "react";
import modalStyles from "./orgSelectModal.module.css";

export default function InviteCodeModal({ isOpen, onClose, onSubmit, onValidate }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validation, setValidation] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCode("");
    setError("");
    setValidation(null);
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

  const handleValidate = async () => {
    try {
      setIsSubmitting(true);
      setError("");
      setValidation(await onValidate(code));
    } catch (err) {
      setValidation(null);
      setError(err.response?.data?.message ?? err.message ?? "유효하지 않은 초대 코드입니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={modalStyles.overlay} onClick={handleClose}>
      <div
        className={`${modalStyles.modal} ${modalStyles.inviteModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={modalStyles.title}>초대 코드 입력</h2>
        <p className={modalStyles.description}>
          단체에서 받은 초대 코드를 입력하세요
        </p>

        <div className={modalStyles.codeField}>
          <input
            type="text"
            className={`${modalStyles.input} ${modalStyles.inviteInput} ${error ? modalStyles.inputError : ""}`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="초대 코드"
          />
          <button
            type="button"
            className={modalStyles.validateBtn}
            onClick={handleValidate}
            disabled={isSubmitting || !code.trim()}
          >
            코드 확인
          </button>
        </div>
        <div className={modalStyles.inviteFeedback}>
          {error && <p className={modalStyles.errorText}>{error}</p>}
          {validation && (
            <p className={modalStyles.validationText}>
              {validation.organizationName ?? validation.organization?.name} · {validation.termName ?? validation.term?.name} · {validation.role}
            </p>
          )}
        </div>

        <div className={`${modalStyles.actions} ${modalStyles.inviteActions}`}>
          <button type="button" className={modalStyles.cancelBtn} onClick={handleClose}>
            취소
          </button>
          <button
            type="button"
            className={modalStyles.primaryBtn}
            onClick={handleSubmit}
            disabled={isSubmitting || !validation}
          >
            입장
          </button>
        </div>
      </div>
    </div>
  );
}
