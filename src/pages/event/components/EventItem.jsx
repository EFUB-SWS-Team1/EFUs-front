import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDateRange } from '../../../utils/format';
import styles from './EventItem.module.css';

const STATUS_MAP = {
  ongoing: { label: '진행 중', className: styles.badgeSuccess },
  warning: { label: '80% 초과', className: styles.badgeWarning },
  over: { label: '예산 초과', className: styles.badgeDanger },
};

export default function EventItem({ event }) {
  const navigate = useNavigate();
  const status = STATUS_MAP[event.status] ?? STATUS_MAP.ongoing;
  const isOverBudget = event.status === 'over';
  const progressWidth = Math.min(event.percent, 100);

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => navigate(`/events/${event.id}`)}
    >
      <div className={styles.topRow}>
        <div className={styles.info}>
          <h3 className={styles.name}>{event.name}</h3>
          <p className={styles.meta}>
            {formatDateRange(event.startDate, event.endDate)} · {event.participants}명 참여
          </p>
        </div>
        <span className={`${styles.badge} ${status.className}`}>{status.label}</span>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressFill} ${isOverBudget ? styles.progressFillOver : ''}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      <div className={styles.bottomRow}>
        <p className={styles.amount}>
          {formatCurrency(event.spent)} / {formatCurrency(event.budget)}
        </p>
        {isOverBudget ? (
          <p className={`${styles.ratio} ${styles.ratioOver}`}>
            +{event.overAmount?.toLocaleString('ko-KR')}원 초과
          </p>
        ) : (
          <p className={styles.ratio}>{event.percent}%</p>
        )}
      </div>
    </button>
  );
}