import { useCallback, useEffect, useState } from "react";
import copyIcon from "../../../assets/Copy.svg";
import styles from "./InviteCodeModal.module.css";
import { getInviteCodes, reissueInviteCode } from "../../../api";

const ROLE_ITEMS = [{ key: "staff", role: "STAFF", label: "운영진" }, { key: "general", role: "MEMBER", label: "일반" }];

export default function InviteCodeModal({ isOpen, termId, onClose }) {
  const [codes, setCodes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loadCodes = useCallback(async () => {
    if (termId == null) return;
    setLoading(true); setError("");
    try { setCodes(await getInviteCodes(termId)); }
    catch (requestError) { setError(requestError.response?.data?.message ?? requestError.message); }
    finally { setLoading(false); }
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
    const handleKeyDown = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  async function reissue(role) {
    setError("");
    try { await reissueInviteCode(termId, role); await loadCodes(); }
    catch (requestError) { setError(requestError.response?.data?.message ?? requestError.message); }
  }

  return <div className={styles.overlay} onClick={onClose}><div className={styles.modal} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.closeBtn} onClick={onClose}>×</button><h2 className={styles.title}>멤버 초대</h2><p className={styles.desc}>코드로 멤버를 초대하세요</p>{loading && <p>불러오는 중...</p>}{error && <p>{error}</p>}<div className={styles.codeList}>{ROLE_ITEMS.map(({ key, role, label }) => <div key={key} className={styles.codeCard}><span className={styles.roleLabel}>{label}</span><div className={styles.codeRow}><span className={[styles.code, key === "staff" ? styles.codeStaff : styles.codeGeneral].join(" ")}>{codes?.[key] || "-"}</span><button type="button" className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(codes?.[key] ?? "")} aria-label={`${label} 코드 복사`}><img src={copyIcon} alt="" className={styles.copyIcon} /></button><button type="button" onClick={() => reissue(role)}>재발급</button></div></div>)}</div><p className={styles.expire}>{codes?.expiresInDays == null ? "만료 시각을 확인해 주세요" : `코드는 ${codes.expiresInDays}일간 유효해요`}</p></div></div>;
}
