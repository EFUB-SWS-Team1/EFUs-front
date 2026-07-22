import { PermissionBadge } from '../../../components/common';
import { formatCurrency } from '../../../utils/format';
import styles from './MemberDetailPanel.module.css';

const ROLE_LABEL = {
  staff: '운영진',
  general: '일반',
};

const DUE_STATUS = {
  paid: { label: '납부', variant: 'success' },
  unpaid: { label: '미납', variant: 'danger' },
};

export default function MemberDetailPanel({
  isOpen,
  detail,
  loading,
  onClose,
}) {
  if (!isOpen) return null;

  const member = detail?.member;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />

      <aside className={styles.panel}>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        {loading && <p className={styles.loading}>불러오는 중...</p>}

        {!loading && member && (
          <>
            <div className={styles.profile}>
              <div className={styles.avatar} />
              <PermissionBadge variant={member.role === 'staff' ? 'staff' : 'general'}>
                {ROLE_LABEL[member.role]}
              </PermissionBadge>
              <h2 className={styles.name}>{member.name}</h2>
              <p className={styles.email}>{member.email}</p>
            </div>

            <div className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryDotPaid} />
                <div>
                  <p className={styles.summaryLabel}>납부 완료</p>
                  <p className={styles.summaryAmountPaid}>
                    {formatCurrency(detail.paidTotal)}
                  </p>
                </div>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryDotUnpaid} />
                <div>
                  <p className={styles.summaryLabel}>미납</p>
                  <p className={styles.summaryAmountUnpaid}>
                    {formatCurrency(detail.unpaidTotal)}
                  </p>
                </div>
              </div>
            </div>

            <h3 className={styles.duesTitle}>회비 납부 현황</h3>
            <ul className={styles.duesList}>
              {detail.dues.map((due) => {
                const status = DUE_STATUS[due.status] ?? DUE_STATUS.unpaid;
                return (
                  <li key={due.id} className={styles.dueItem}>
                    <div>
                      <p className={styles.dueLabel}>{due.label}</p>
                      <p className={styles.dueMeta}>
                        1인당 {formatCurrency(due.amount)} · 기한 {due.dueDate}
                      </p>
                    </div>
                    <PermissionBadge variant={status.variant}>
                      {status.label}
                    </PermissionBadge>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}