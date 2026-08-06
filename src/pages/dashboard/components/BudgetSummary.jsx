import ProgressBar from "../../../components/common/ProgressBar";
import styles from "./BudgetSummary.module.css";

function formatWon(amount) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/**
 * summary: { totalIncome, totalExpense, balance, usageRate }
 */
export default function BudgetSummary({ summary }) {
  const { totalIncome, totalExpense, balance, usageRate } = summary;

  return (
    <div className={styles.wrapper}>
      <div className={styles.cardGrid}>
        <div className={`${styles.card} ${styles.statCard}`}>
          <p className={styles.label}>총 수입</p>
          <p className={styles.value}>{formatWon(totalIncome)}</p>
        </div>
        <div className={`${styles.card} ${styles.statCard}`}>
          <p className={styles.label}>총 지출</p>
          <p className={styles.value}>{formatWon(totalExpense)}</p>
        </div>
        <div className={`${styles.card} ${styles.statCard}`}>
          <p className={styles.label}>잔액</p>
          <p className={styles.value}>{formatWon(balance)}</p>
        </div>
      </div>

      <div className={`${styles.card} ${styles.usageCard}`}>
        <div className={styles.usageHeader}>
          <p className={styles.label}>수입 사용률</p>
          <p className={styles.usagePercent}>{usageRate}%</p>
        </div>
        <ProgressBar percent={usageRate} className={styles.usageBar} />
      </div>
    </div>
  );
}