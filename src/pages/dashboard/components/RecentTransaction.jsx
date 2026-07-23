import styles from "./RecentTransaction.module.css";

function formatAmount(amount) {
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toLocaleString("ko-KR")}`;
}

export default function RecentTransaction({ transactions }) {
  const recent = transactions.slice(0, 3);

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
          {recent.map((tx) => (
            <div key={tx.id} className={styles.dataRow}>
              <span className={styles.cell}>{tx.date}</span>
              <span className={styles.cell}>{tx.eventName}</span>
              <span className={`${styles.cell} ${styles.description}`}>{tx.description}</span>
              <span
                className={`${styles.cell} ${styles.alignRight} ${
                  tx.amount > 0 ? styles.positive : styles.negative
                }`}
              >
                {formatAmount(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}