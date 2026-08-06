import { useCallback, useEffect, useState } from "react";
import copyIcon from "../../../assets/Copy.svg";
import checkIcon from "../../../assets/Check.svg";
import styles from "./InviteCodeModal.module.css";
import { getInviteCodes } from "../../../api";

const ROLE_ITEMS = [
  { key: "staff", label: "운영진" },
  { key: "general", label: "일반" },
];

export default function InviteCodeModal({ isOpen, termId, onClose }) {
  const [codes, setCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState({ staff: false, general: false });

  const loadCodes = useCallback(async () => {
    if (termId == null) return;
    setLoading(true);
    setError("");
    try {
      setCodes(await getInviteCodes(termId));
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? requestError.message);
    } finally {
      setLoading(false);
    }
  }, [termId]);

  useEffect(() => {
    if (isOpen) {
      // Async API synchronization intentionally starts when the modal opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadCodes();
    }
  }, [isOpen, loadCodes]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function copyCode(key, code) {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied((current) => ({ ...current, [key]: true }));
      window.setTimeout(() => {
        setCopied((current) => ({ ...current, [key]: false }));
      }, 1500);
    } catch {
      setCopied((current) => ({ ...current, [key]: false }));
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <section
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <header className={styles.header}>
          <h2 id="invite-modal-title" className={styles.title}>멤버 초대</h2>
          <p className={styles.desc}>코드로 멤버를 초대하세요</p>
        </header>

        {loading && <p className={styles.status}>초대 코드를 불러오는 중...</p>}
        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.codeList}>
          {ROLE_ITEMS.map(({ key, label }) => (
            <article key={key} className={styles.codeCard}>
              <span className={styles.roleLabel}>{label}</span>
              <div className={styles.codeRow}>
                <code
                  className={[
                    styles.code,
                    key === "staff" ? styles.codeStaff : styles.codeGeneral,
                  ].join(" ")}
                >
                  {codes?.[key] || "-"}
                </code>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => copyCode(key, codes?.[key])}
                  aria-label={`${label} 초대 코드 복사`}
                >
                  <img
                    src={copied[key] ? checkIcon : copyIcon}
                    alt=""
                    className={styles.copyIcon}
                  />
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className={styles.expire}>
          {codes?.expiresInDays == null
            ? "만료 시각을 확인해 주세요"
            : `코드는 ${codes.expiresInDays}일간 유효해요`}
        </p>
      </section>
    </div>
  );
}
