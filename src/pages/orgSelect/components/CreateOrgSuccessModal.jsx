import { useEffect } from "react";
import checkIcon from "../../../assets/Check.svg";
import copyIcon from "../../../assets/Copy.svg";
import modalStyles from "./orgSelectModal.module.css";
import styles from "./CreateOrgSuccessModal.module.css";

const CODE_ITEMS = [
  { key: "staff", label: "운영진", codeClass: styles.codeStaff },
  { key: "general", label: "일반", codeClass: styles.codeGeneral },
];

export default function CreateOrgSuccessModal({ isOpen, inviteCodes, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard 미지원 */
    }
  }

  return (
    <div className={modalStyles.overlay} onClick={onClose}>
      <div
        className={[modalStyles.modal, styles.successModal].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.checkBox}>
            <img src={checkIcon} alt="" className={styles.checkIcon} />
          </div>
          <h2 className={styles.successTitle}>단체가 생성됐어요!</h2>
          <p className={styles.successDescription}>
            초대 코드를 공유해 멤버를 초대해보세요
          </p>
        </div>

        <div className={styles.codeList}>
          {CODE_ITEMS.map(({ key, label, codeClass }) => (
            <div key={key} className={styles.codeCard}>
              <div className={styles.codeInfo}>
                <span className={styles.roleLabel}>{label}</span>
                <span className={[styles.code, codeClass].join(" ")}>
                  {inviteCodes?.[key] ?? "..."}
                </span>
              </div>

              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => handleCopy(inviteCodes?.[key])}
                aria-label={`${label} 코드 복사`}
              >
                <img src={copyIcon} alt="" className={styles.copyIcon} />
              </button>
            </div>
          ))}
        </div>

        <button type="button" className={styles.backBtn} onClick={onClose}>
          돌아가기
        </button>
      </div>
    </div>
  );
}