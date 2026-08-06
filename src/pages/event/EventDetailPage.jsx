import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEventDetail, updateEvent } from "../../api";
import { formatCurrency, formatDate, formatDateRange, formatNumber } from "../../utils/format";
import { Button, PermissionBadge } from "../../components/common";
import EventFormModal from "./components/EventFormModal";
import styles from "./EventDetailPage.module.css";
import chevronLeft from "../../assets/Chevron left.svg";

const STATUS_MAP = {
  ongoing: { label: "진행 중", variant: "success" },
  warning: { label: "80% 초과", variant: "warning" },
  over: { label: "예산 초과", variant: "danger" },
};

const GENERATION_ID = "efub-6";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadDetail = useCallback(() => {
    getEventDetail(GENERATION_ID, eventId)
      .then((data) => {
        setEvent(data.event);
        setTransactions(data.transactions);
      })
      .catch(() => setEvent(null));
  }, [eventId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  async function handleUpdate(payload) {
    await updateEvent(GENERATION_ID, eventId, payload);
    setIsEditOpen(false);
    loadDetail();
  }

  if (!event) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>행사를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const status = STATUS_MAP[event.status] ?? STATUS_MAP.ongoing;
  const isOverBudget = event.status === "over";
  const progressWidth = Math.min(event.percent, 100);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button
          variant="secondary"
          icon={<img src={chevronLeft} alt="" className={styles.backIcon} />}
          className={styles.backBtn}
          onClick={() => navigate("/events")}
        >
          행사 목록으로
        </Button>
        <Button variant="secondary" className={styles.editBtn} onClick={() => setIsEditOpen(true)}>
          수정
        </Button>
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryTop}>
          <div>
            <h1 className={styles.eventName}>{event.name}</h1>
            <p className={styles.eventMeta}>
              {formatDateRange(event.startDate, event.endDate)} · {event.participants}명 참여
            </p>
          </div>
          <PermissionBadge variant={status.variant} className={styles.statusBadge}>
            {status.label}
          </PermissionBadge>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progressWidth}%` }} />
        </div>

        <div className={styles.budgetRow}>
          <p className={styles.budgetAmount}>
            {formatCurrency(event.spent)} / {formatCurrency(event.budget)}
          </p>
          {isOverBudget ? (
            <p className={`${styles.budgetRatio} ${styles.budgetRatioOver}`}>
              +{formatNumber(event.overAmount)}원 초과
            </p>
          ) : (
            <p className={styles.budgetRatio}>{event.percent}%</p>
          )}
        </div>
      </div>

      <h2 className={styles.sectionTitle}>관련 거래 내역</h2>

      <div className={styles.transactionCard}>
        <div className={styles.tableHeader}>
          <span>날짜</span>
          <span>내용</span>
          <span>금액</span>
        </div>

        {transactions.length === 0 ? (
          <p className={styles.emptyTransactions}>관련 거래 내역이 없습니다.</p>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className={styles.tableRow}>
              <span className={styles.colDate}>{formatDate(tx.date)}</span>
              <span className={styles.colDesc}>{tx.description}</span>
              <span
                className={`${styles.colAmount} ${
                  tx.amount >= 0 ? styles.amountIncome : styles.amountExpense
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatNumber(tx.amount)}
              </span>
            </div>
          ))
        )}
      </div>

      <EventFormModal
        isOpen={isEditOpen}
        title="행사 수정"
        initialValues={event}
        submitLabel="저장"
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
