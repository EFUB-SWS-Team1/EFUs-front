import { useEffect, useState } from "react";
import { PermissionBadge, Card } from "../../../components/common";
import { formatCurrency } from "../../../utils/format";
import { getMemberCharges } from "../../../api";
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
  termId,
  termMemberId,
  loading,
  error,
  onClose,
}) {
  const [charges, setCharges] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [chargesError, setChargesError] = useState("");

  useEffect(() => {
    if (!isOpen || termId == null || termMemberId == null) return;
    let active = true;
    // Async API synchronization intentionally starts when query state changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChargesLoading(true);
    setChargesError("");
    getMemberCharges(termId, termMemberId, { page, size: 7 })
      .then((result) => {
        if (!active) return;
        setCharges(result.content);
        setTotalPages(result.totalPages);
      })
      .catch((requestError) => {
        if (active) setChargesError(requestError.response?.data?.message ?? requestError.message);
      })
      .finally(() => { if (active) setChargesLoading(false); });
    return () => { active = false; };
  }, [isOpen, page, termId, termMemberId]);

  if (!isOpen) return null;

  const member = detail?.member;

  return (
      <aside className={styles.panel} aria-label="구성원 상세">
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>

        {loading && <p className={styles.loading}>불러오는 중...</p>}
        {!loading && error && <p className={styles.loading}>{error}</p>}

        {!loading && member && (
          <>
            {/* 상단: 프로필 (460 × padding 40, gap 12) */}
            <div className={styles.headerSection}>
              <div className={styles.profileRow}>
                {member.profileImageUrl ? (
                  <img
                    className={styles.avatar}
                    src={member.profileImageUrl}
                    alt=""
                  />
                ) : (
                  <div className={styles.avatar} aria-hidden="true" />
                )}

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
              {chargesLoading && <p className={styles.message}>불러오는 중...</p>}
              {!chargesLoading && chargesError && <p className={styles.message}>{chargesError}</p>}
              <ul className={styles.duesList}>
                {charges.map((due) => {
                  const status = DUE_STATUS[due.status] ?? DUE_STATUS.unpaid;
                  return (
                    <li key={due.id}>
                      <Card className={styles.dueCard}>
                        <div className={styles.dueItem}>
                          <div className={styles.dueText}>
                            <p className={styles.dueLabel}>{due.label}</p>
                            <p className={styles.dueMeta}>
                              1인당 {formatCurrency(due.amount)} · 기한{" "}
                              {formatDueDate(due.dueDate)}
                            </p>
                          </div>
                          <PermissionBadge
                            variant={status.variant}
                            className={styles.dueStatusBadge}
                          >
                            {status.label}
                          </PermissionBadge>
                        </div>
                      </Card>
                    </li>
                  );
                })}
              </ul>
              {!chargesLoading && !chargesError && charges.length === 0 && <p className={styles.message}>회비 내역이 없습니다.</p>}
              {totalPages > 1 && <div className={styles.pagination}><button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page + 1} / {totalPages}</span><button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>다음</button></div>}
            </div>
          </>
        )}
      </aside>
  );
}

function formatDueDate(dateValue) {
  if (!dateValue) return "-";
  const parts = String(dateValue).split("-");
  return parts.length >= 3 ? `${parts[1]}.${parts[2].slice(0, 2)}` : dateValue;
}
