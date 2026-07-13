import styles from './DashboardPage.module.css';

// 임시 더미 데이터 (나중에 API로 교체)
const DUMMY_DATA = {
  groupName: 'EFUB',
  totalBudget: 1000000,
  totalExpense: 700000,
  balance: 300000,
  usageRate: 30,
  members: [
    { name: '홍길동', role: '운영진' },
    { name: '홍길동', role: '일반' },
    { name: '홍길동', role: '일반' },
    { name: '홍길동', role: '일반' },
    { name: '홍길동', role: '일반' },
    { name: '홍길동', role: '일반' },
  ],
  totalMembers: 25,
  duesPaid: 20,
  duesUnpaid: 5,
  recentTransactions: [
    { date: '2026.06.23', content: '6월 회식', category: '회식비', amount: -200000 },
    { date: '2026.06.23', content: '1학기 벌금', category: '기타', amount: 30000 },
    { date: '2026.06.08', content: '동아리 지원금', category: '기타', amount: 100000 },
    { date: '2026.06.05', content: '6월 정기 회비', category: '회비', amount: 240000 },
  ],
};

function DashboardPage() {
  const data = DUMMY_DATA;

  const formatAmount = (amount) => {
    const abs = Math.abs(amount).toLocaleString();
    if (amount > 0) return `+${abs}`;
    if (amount < 0) return `-${abs}`;
    return abs;
  };

  return (
    <div className={styles.page}>

      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <span className={styles.groupIcon}>⠿</span>
        <h1 className={styles.groupName}>{data.groupName}</h1>
        <span className={styles.groupTitle}>의 공동 가계부입니다</span>
        <button className={styles.editBtn}>✏️</button>
      </div>

      {/* 예산 요약 카드 3개 */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>총 예산</span>
          <span className={styles.cardValue}>{data.totalBudget.toLocaleString()}원</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>총 지출</span>
          <span className={styles.cardValue}>{data.totalExpense.toLocaleString()}원</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>잔액</span>
          <span className={styles.cardValue}>{data.balance.toLocaleString()}원</span>
        </div>
      </div>

      {/* 예산 사용률 */}
      <div className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>예산 사용률</span>
          <span className={styles.progressPercent}>{data.usageRate}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${data.usageRate}%` }}
          />
        </div>
      </div>

      {/* 멤버 + 회비 납부 현황 */}
      <div className={styles.midSection}>

        {/* 멤버 */}
        <div className={styles.memberCard}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>멤버</span>
            <span className={styles.memberCount}>👥 {data.totalMembers}</span>
          </div>
          <div className={styles.memberGrid}>
            {data.members.map((member, idx) => (
              <div key={idx} className={styles.memberItem}>
                <span className={`${styles.roleBadge} ${member.role === '운영진' ? styles.admin : styles.general}`}>
                  {member.role}
                </span>
                <span className={styles.memberName}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 회비 납부 현황 */}
        <div className={styles.duesSection}>
          <div className={styles.sectionTitle}>회비 납부 현황</div>
          <div className={styles.duesCards}>
            <div className={styles.duesCard}>
              <div className={styles.duesStatus}>
                <span className={styles.dotGreen} />
                납부 완료
              </div>
              <div className={styles.duesCount}>{data.duesPaid}명</div>
              <div className={styles.duesRate}>전체 {Math.round(data.duesPaid / data.totalMembers * 100)}%</div>
            </div>
            <div className={styles.duesCard}>
              <div className={styles.duesStatus}>
                <span className={styles.dotRed} />
                미납
              </div>
              <div className={styles.duesCount}>{data.duesUnpaid}명</div>
              <div className={styles.duesRate}>전체 {Math.round(data.duesUnpaid / data.totalMembers * 100)}%</div>
            </div>
          </div>
        </div>

      </div>

      {/* 최근 거래 내역 */}
      <div className={styles.transactionSection}>
        <div className={styles.sectionTitle}>최근 거래 내역</div>
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
            {data.recentTransactions.map((tx, idx) => (
              <tr key={idx}>
                <td>{tx.date}</td>
                <td>{tx.content}</td>
                <td>{tx.category}</td>
                <td className={tx.amount < 0 ? styles.negative : styles.positive}>
                  {formatAmount(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default DashboardPage;