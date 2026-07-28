import { useEffect, useState } from 'react';
import { getInviteCodes } from '../../../api/groupManage';
import copyIcon from '../../../assets/Copy.svg';
import styles from './InviteCodeModal.module.css';

const ROLE_ITEMS = [
  { key: 'staff', label: '운영진' },
  { key: 'general', label: '일반' },
];

export default function InviteCodeModal({ isOpen, generationId, onClose }) {
  const [codes, setCodes] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    getInviteCodes(generationId).then(setCodes);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, generationId, onClose]);

  if (!isOpen) return null;

  async function handleCopy(code) {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard 미지원 환경 */
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        <h2 className={styles.title}>멤버 초대</h2>
        <p className={styles.desc}>코드로 멤버를 초대하세요</p>

        <div className={styles.codeList}>
          {ROLE_ITEMS.map(({ key, label }) => (
            <div key={key} className={styles.codeCard}>
              <span className={styles.roleLabel}>{label}</span>
              <div className={styles.codeRow}>
                <span
                  className={[
                    styles.code,
                    key === 'staff' ? styles.codeStaff : styles.codeGeneral,
                  ].join(' ')}
                >
                  {codes?.[key] ?? '...'}
                </span>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopy(codes?.[key])}
                  aria-label={`${label} 코드 �복사`}
                >
                  <img src={copyIcon} alt="" className={styles.copyIcon} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className={styles.expire}>
          코드는 {codes?.expiresInDays ?? 7}일간 유효해요
        </p>
      </div>
    </div>
  );
}