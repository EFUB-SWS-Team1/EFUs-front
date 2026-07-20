import styles from "./RecentTransaction.module.css";

function formatAmount(amount) {
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toLocaleString("ko-KR")}`;
}

/**
 * transactions: [{ id, date, eventName, description, amount }]
 * 최대 3건만 표시 (전체 내역은 가계부 페이지에서 확인)
 */
export default function RecentTransaction({ transactions }) {
  const recent = transactions.slice(0, 3);

  return (
    <div className={styles.card}>
      <p className={styles.title}>최근 거래 내역</p>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.headerCell}>날짜</th>
            <th className={styles.headerCell}>행사</th>
            <th className={styles.headerCell}>내용</th>
            <th className={`${styles.headerCell} ${styles.alignRight}`}>금액</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((tx) => (
            <tr key={tx.id} className={styles.row}>
              <td className={styles.cell}>{tx.date}</td>
              <td className={styles.cell}>{tx.eventName}</td>
              <td className={`${styles.cell} ${styles.description}`}>{tx.description}</td>
              <td
                className={`${styles.cell} ${styles.alignRight} ${
                  tx.amount > 0 ? styles.positive : styles.negative
                }`}
              >
                {formatAmount(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}