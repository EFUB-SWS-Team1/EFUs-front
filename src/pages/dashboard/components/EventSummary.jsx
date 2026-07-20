import Badge from "../../../components/common/Badge";
import ProgressBar from "../../../components/common/ProgressBar";
import styles from "./EventSummary.module.css";

function formatWon(amount) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// 행사 status -> 뱃지 variant / 라벨
function getBadgeProps(event) {
  switch (event.status) {
    case "ongoing":
      return { variant: "success", label: "진행 중" };
    case "warning":
      return { variant: "warning", label: `${event.percent}% 초과` };
    case "over":
      return { variant: "danger", label: "예산 초과" };
    default:
      return { variant: "neutral", label: "-" };
  }
}

function EventCard({ event }) {
  const { variant, label } = getBadgeProps(event);
  const isOver = event.status === "over";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.eventName}>{event.name}</p>
        <Badge variant={variant}>{label}</Badge>
      </div>

      <ProgressBar percent={event.percent} variant={isOver ? "danger" : "default"} className={styles.progress} />

      <div className={styles.cardFooter}>
        <p className={styles.amountText}>
          {formatWon(event.spent)} / {formatWon(event.budget)}
        </p>
        {isOver ? (
          <p className={styles.overText}>+{formatWon(event.overAmount)} 초과</p>
        ) : (
          <p className={styles.amountText}>{event.percent}%</p>
        )}
      </div>
    </div>
  );
}

/**
 * events: [{ id, name, status: 'ongoing'|'warning'|'over', spent, budget, percent, overAmount? }]
 */
export default function EventSummary({ events }) {
  return (
    <div>
      <p className={styles.title}>행사별 예산</p>
      <div className={styles.grid}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}