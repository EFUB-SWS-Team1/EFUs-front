import { useNavigate, useParams } from 'react-router-dom';
import styles from './BudgetDetailPage.module.css';

const DUMMY_DETAIL = {
  1: {
    name: '8월 MT',
    startDate: '2026.08.08',
    endDate: '2026.08.09',
    participants: 25,
    spent: 300000,
    budget: 600000,
    status: 'ongoing',
    categories: [
      { name: '대여비', amount: 300000, rate: 100 },
    ],
    transactions: [
      { date: '2026.07.05', content: 'MT 회비', category: '회비', amount: 600000 },
      { date: '2026.07.03', content: 'MT 숙소비', category: '대여비', amount: -300000 },
    ],
  },
};

function BudgetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = DUMMY_DETAIL[id];

  if (!data) return <div>데이터가 없습니다.</div>;

  const rate = Math.min(Math.round((data.spent / data.budget) * 100), 100);
  const isOver = data.spent > data.budget;

  return (
    <div className={styles.page}>

      {/* 뒤로가기 */}
      <button className={styles.backBtn} onClick={() => navigate('/budget')}>
        ← 예산 목록으로
      </button>

      {/* 행사 요약 카드 */}
      <div className={styles.eventCard}>
        <div className={styles.eventTop}>
          <div>
            <div className={styles.eventName}>{data.name}</div>
            <div className={styles.eventMeta}>
              {data.startDate} - {data.endDate} · {data.participants}명 참여
            </div>
          </div>
          {isOver && <span className={styles.badgeOver}>예산 초과</span>}
        </div>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${isOver ? styles.progressOver : ''}`}
            style={{ width: `${rate}%` }}
          />
        </div>
        <div className={styles.eventBottom}>
          <span>{data.spent.toLocaleString()}원 / {data.budget.toLocaleString()}원</span>
          <span>{rate}%</span>
        </div>
      </div>

      {/* 항목별 지출 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>항목별 지출</span>
          <span className={styles.sectionSub}>전체 지출 대비 각 항목의 비중</span>
        </div>
        {data.categories.map((cat, idx) => (
          <div key={idx} className={styles.categoryCard}>
            <div className={styles.categoryTop}>
              <span>{cat.name}</span>
              <span>{cat.amount.toLocaleString()}원 · {cat.rate}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${cat.rate}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* 관련 거래 내역 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>관련 거래 내역</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>날짜</th>
              <th>내용</th>
              <th>항목</th>
              <th>금액</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map((tx, idx) => (
              <tr key={idx}>
                <td>{tx.date}</td>
                <td>{tx.content}</td>
                <td>{tx.category}</td>
                <td className={tx.amount < 0 ? styles.negative : styles.positive}>
                  {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default BudgetDetailPage;