import { PermissionBadge, Card } from "../../../components/common";
import { formatCurrency } from "../../../utils/format";
import styles from "./MemberDetailPanel.module.css";

const ROLE_LABEL = {
  staff: "운영진",
  general: "일반",
};

const DUE_STATUS = {
  paid: { label: "납부", variant: "success" },
  unpaid: { label: "미납", variant: "danger" },
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
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

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
            {/* 상단: 프로필 (460 × padding 40, gap 12) */}
            <div className={styles.headerSection}>
              <div className={styles.profileRow}>
                <div className={styles.avatar} aria-hidden="true" />

                <div className={styles.profileInfo}>
                  <div className={styles.nameRow}>
                    <PermissionBadge
                      variant={member.role === "staff" ? "staff" : "general"}
                    >
                      {ROLE_LABEL[member.role]}
                    </PermissionBadge>
                    <h2 className={styles.name}>{member.name}</h2>
                  </div>
                  <p className={styles.email}>{member.email}</p>
                </div>
              </div>
            </div>

            {/* 하단: 납부 정보 (padding 40, gap 20) */}
            <div className={styles.bodySection}>
              <div className={styles.summaryRow}>
                <Card className={styles.summaryCard}>
                  <div className={styles.summaryInner}>
                    <span className={styles.summaryDotPaid} />
                    <div>
                      <p className={styles.summaryLabel}>납부 완료</p>
                      <p className={styles.summaryAmountPaid}>
                        {formatCurrency(detail.paidTotal)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className={styles.summaryCard}>
                  <div className={styles.summaryInner}>
                    <span className={styles.summaryDotUnpaid} />
                    <div>
                      <p className={styles.summaryLabel}>미납</p>
                      <p className={styles.summaryAmountUnpaid}>
                        {formatCurrency(detail.unpaidTotal)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <h3 className={styles.duesTitle}>회비 납부 현황</h3>
              <ul className={styles.duesList}>
                {detail.dues.map((due) => {
                  const status = DUE_STATUS[due.status] ?? DUE_STATUS.unpaid;
                  return (
                    <li key={due.id}>
                      <Card className={styles.dueCard}>
                        <div className={styles.dueItem}>
                          <div className={styles.dueText}>
                            <p className={styles.dueLabel}>{due.label}</p>
                            <p className={styles.dueMeta}>
                              1인당 {formatCurrency(due.amount)} · 기한{" "}
                              {due.dueDate}
                            </p>
                          </div>
                          <PermissionBadge variant={status.variant}>
                            {status.label}
                          </PermissionBadge>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
