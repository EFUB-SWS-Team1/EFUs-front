import { useState } from 'react';
import styles from './MemberInviteModal.module.css';

const DUMMY_INVITE_CODE = 'F2XC4L';
const DUMMY_INVITE_LINK = 'https://efub.app/invite/F2XC4L';

function MemberInviteModal({ onClose }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(DUMMY_INVITE_CODE);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(DUMMY_INVITE_LINK);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.title}>멤버 초대</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p className={styles.desc}>코드나 링크로 멤버를 초대하세요</p>

        {/* 초대 코드 */}
        <div className={styles.codeBox}>
          <div className={styles.codeLeft}>
            <span className={styles.code}>{DUMMY_INVITE_CODE}</span>
            <span className={styles.codeExpiry}>코드는 7일간 유효해요</span>
          </div>
          <button className={styles.copyCodeBtn} onClick={handleCopyCode}>
            {codeCopied ? '✓' : '⧉'}
          </button>
        </div>

        {/* 초대 링크 복사 */}
        <button className={styles.linkBtn} onClick={handleCopyLink}>
          {linkCopied ? '✓ 복사됨' : '초대 링크 복사하기'}
        </button>

        {/* 카카오 공유 */}
        <button className={styles.kakaoBtn}>
          💬 카카오톡으로 공유하기
        </button>
      </div>
    </div>
  );
}

export default MemberInviteModal;