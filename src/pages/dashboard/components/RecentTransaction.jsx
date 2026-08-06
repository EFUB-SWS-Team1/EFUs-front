import { formatDate, formatNumber } from "../../../utils/format";
import styles from "./RecentTransaction.module.css";

function getDisplayAmount(entry) {
  return entry.entryType === "CHARGE" ? entry.requestedAmount : entry.amount;
}

function formatAmount(entry) {
  const amount = Number(getDisplayAmount(entry) ?? 0);
  const sign = entry.cashFlowType === "INCOME" ? "+" : "-";
  return `${sign}${formatNumber(Math.abs(amount))}`;
}

function getDescription(entry) {
  if (entry.entryType !== "CHARGE") return entry.title;
  return `${entry.title} (납부 ${formatNumber(entry.paidAmount)} / 미납 ${formatNumber(entry.unpaidAmount)})`;
}

export default function RecentTransaction({ entries }) {
  const recent = entries.slice(0, 3);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>최근 거래 내역</h2>
      <div className={styles.tableCard}>
        <div className={styles.headerRow}>
          <span className={styles.headerCell}>날짜</span>
          <span className={styles.headerCell}>행사</span>
          <span className={styles.headerCell}>내용</span>
          <span className={`${styles.headerCell} ${styles.alignRight}`}>금액</span>
        </div>
        <div className={styles.tableBody}>
          {recent.length === 0 ? (
            <span className={styles.cell}>최근 거래 내역이 없습니다.</span>
          ) : recent.map((entry) => (
            <div key={`${entry.entryType}-${entry.entryId}`} className={styles.dataRow}>
              <span className={styles.cell}>{formatDate(entry.transactionDate)}</span>
              <span className={styles.cell}>{entry.fundingName ?? "-"}</span>
              <span className={`${styles.cell} ${styles.description}`}>{getDescription(entry)}</span>
              <span className={`${styles.cell} ${styles.alignRight} ${
                entry.cashFlowType === "INCOME" ? styles.positive : styles.negative
              }`}>
                {formatAmount(entry)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
