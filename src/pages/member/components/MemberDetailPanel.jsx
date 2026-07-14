import { useState } from 'react';
import styles from './MemberDetailPanel.module.css';

function MemberDetailPanel({ member, isAdmin, onClose, onRoleChange }) {
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleRoleChange = (newRole) => {
    onRoleChange(member.id, newRole);
    setShowRoleModal(false);
  };

  return (
    <div className={styles.panel}>

      {/* 닫기 버튼 */}
      <button className={styles.closeBtn} onClick={onClose}>✕</button>

      {/* 프로필 */}
      <div className={styles.profileSection}>
        <div className={styles.avatar} />
        <div className={styles.name}>{member.name}</div>
        <span className={`${styles.roleBadge} ${member.role === 'admin' ? styles.adminBadge : styles.generalBadge}`}>
          {member.role === 'admin' ? '운영진' : '일반'}
        </span>
        <div className={styles.email}>{member.email}</div>
        {isAdmin && (
          <button className={styles.roleChangeBtn} onClick={() => setShowRoleModal(true)}>
            권한 변경
          </button>
        )}
      </div>

      {/* 납부 요약 */}
      <div className={styles.duesSummary}>
        <div className={styles.duesCard}>
          <div className={styles.duesLabel}>
            <span className={styles.dotGreen} /> 납부 완료
          </div>
          <div className={styles.duesAmount}>{member.duesPaid.toLocaleString()}원</div>
        </div>
        <div className={styles.duesCard}>
          <div className={styles.duesLabel}>
            <span className={styles.dotRed} /> 미납
          </div>
          <div className={styles.duesAmount}>{member.duesUnpaid.toLocaleString()}원</div>
        </div>
      </div>

      {/* 회비 납부 현황 */}
      {member.dues.length > 0 && (
        <div className={styles.duesList}>
          <div className={styles.sectionTitle}>회비 납부 현황</div>
          {member.dues.map((due, idx) => (
            <div key={idx} className={styles.duesItem}>
              <div>
                <div className={styles.duesName}>{due.name}</div>
                <div className={styles.duesMeta}>1인당 {due.amount.toLocaleString()}원 · 기한 {due.due}</div>
              </div>
              <span className={due.status === 'paid' ? styles.paid : styles.unpaid}>
                {due.status === 'paid' ? '납부' : '미납'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 권한 변경 모달 */}
      {showRoleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>권한 변경</span>
              <button className={styles.modalClose} onClick={() => setShowRoleModal(false)}>✕</button>
            </div>
            <p className={styles.modalDesc}>{member.name}의 권한을 변경합니다</p>
            <button
              className={styles.roleBtn}
              onClick={() => handleRoleChange('member')}
            >
              일반 멤버로 변경
            </button>
            <button
              className={`${styles.roleBtn} ${styles.kickBtn}`}
              onClick={() => handleRoleChange('kicked')}
            >
              멤버 강퇴
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MemberDetailPanel;