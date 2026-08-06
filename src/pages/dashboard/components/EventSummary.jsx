import Badge from "../../../components/common/Badge";
import ProgressBar from "../../../components/common/ProgressBar";
import { formatCurrency } from "../../../utils/format";
import styles from "./EventSummary.module.css";

function getBadgeProps(budget) {
  switch (budget.budgetStatus) {
    case "NORMAL":
      return { variant: "success", label: "정상" };
    case "WARNING":
      return { variant: "warning", label: "주의" };
    case "EXCEEDED":
      return { variant: "danger", label: "예산 초과" };
    default:
      return { variant: "neutral", label: "-" };
  }
}

function EventCard({ budget }) {
  const { variant, label } = getBadgeProps(budget);
  const isExceeded = budget.budgetStatus === "EXCEEDED";

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <p className={styles.eventName}>{budget.name}</p>
        <Badge variant={variant}>{label}</Badge>
      </div>
      <ProgressBar
        percent={budget.usageRate}
        variant={isExceeded ? "danger" : "default"}
        className={styles.progress}
      />
      <div className={styles.cardFooter}>
        <p className={styles.amountText}>
          {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.budgetAmount)}
        </p>
        {isExceeded ? (
          <p className={styles.overText}>+{formatCurrency(budget.exceededAmount)} 초과</p>
        ) : (
          <p className={styles.amountText}>{budget.usageRate}%</p>
        )}
      </div>
    </div>
  );
}

export default function EventSummary({ budgets }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>행사별 예산</h2>
      {budgets.length === 0 ? (
        <p className={styles.amountText}>등록된 행사 예산이 없습니다.</p>
      ) : (
        <div className={styles.grid}>
          {budgets.map((budget) => (
            <EventCard key={budget.fundingId} budget={budget} />
          ))}
        </div>
      )}
    </section>
  );
}
