import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BudgetPage.module.css';
import BudgetEditModal from './components/BudgetEditModal';
import EventAddModal from './components/EventAddModal';

const DUMMY_BUDGET = {
  totalBudget: 1000000,
  totalExpense: 700000,
  balance: 300000,
};

const DUMMY_EVENTS = [
  {
    id: 1,
    name: '8월 MT',
    startDate: '2025.08.08',
    endDate: '2026.08.09',
    participants: 25,
    spent: 300000,
    budget: 600000,
    status: 'ongoing', // ongoing | warning | over
  },
  {
    id: 2,
    name: '중간고사 뒷풀이',
    startDate: '2025.04.',
    endDate: null,
    participants: 25,
    spent: 190000,
    budget: 200000,
    status: 'warning',
  },
  {
    id: 3,
    name: '3월 OT 회식',
    startDate: '2025.03.03',
    endDate: null,
    participants: 33,
    spent: 150000,
    budget: 100000,
    status: 'over',
  },
];

function BudgetPage() {
  const navigate = useNavigate();
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [budget, setBudget] = useState(DUMMY_BUDGET);
  const [events, setEvents] = useState(DUMMY_EVENTS);

  const getUsageRate = (spent, total) => {
    const rate = Math.round((spent / total) * 100);
    return rate > 100 ? 100 : rate;
  };

  const getStatusBadge = (status, spent, budgetAmt) => {
    if (status === 'over') return { label: '예산 초과', className: styles.badgeOver };
    if (status === 'warning') return { label: '80% 초과', className: styles.badgeWarning };
    return { label: '진행 중', className: styles.badgeOngoing };
  };

  const handleBudgetSave = (newBudget) => {
    setBudget((prev) => ({ ...prev, totalBudget: newBudget }));
    setShowBudgetModal(false);
  };

  const handleEventAdd = (newEvent) => {
    setEvents((prev) => [...prev, { ...newEvent, id: Date.now(), spent: 0, status: 'ongoing' }]);
    setShowEventModal(false);
  };

  return (
    <div className={styles.page}>

      {/* 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.titleRow}>
          <span className={styles.groupIcon}>⠿</span>
          <h1 className={styles.title}>예산</h1>
        </div>
        <button className={styles.editBtn} onClick={() => setShowBudgetModal(true)}>
          예산 수정
        </button>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>총 예산</span>
          <span className={styles.cardValue}>{budget.totalBudget.toLocaleString()}원</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>총 지출</span>
          <span className={styles.cardValue}>{budget.totalExpense.toLocaleString()}원</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>잔액</span>
          <span className={styles.cardValue}>{budget.balance.toLocaleString()}원</span>
        </div>
      </div>

      {/* 행사별 예산 */}
      <div className={styles.eventSection}>
        <div className={styles.eventHeader}>
          <span className={styles.sectionTitle}>행사별 예산</span>
          <button className={styles.addBtn} onClick={() => setShowEventModal(true)}>
            + 행사 등록
          </button>
        </div>

        <div className={styles.eventList}>
          {events.map((event) => {
            const rate = getUsageRate(event.spent, event.budget);
            const badge = getStatusBadge(event.status, event.spent, event.budget);
            const isOver = event.status === 'over';

            return (
              <div
                key={event.id}
                className={styles.eventCard}
                onClick={() => navigate(`/budget/${event.id}`)}
              >
                <div className={styles.eventTop}>
                  <div>
                    <div className={styles.eventName}>{event.name}</div>
                    <div className={styles.eventMeta}>
                      {event.startDate}
                      {event.endDate ? ` - ${event.endDate}` : ''}
                      {` · ${event.participants}명 참여`}
                    </div>
                  </div>
                  <span className={`${styles.badge} ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={`${styles.progressFill} ${isOver ? styles.progressOver : ''}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>

                <div className={styles.eventBottom}>
                  <span>{event.spent.toLocaleString()}원 / {event.budget.toLocaleString()}원</span>
                  {isOver
                    ? <span className={styles.overText}>+{(event.spent - event.budget).toLocaleString()}원 초과</span>
                    : <span>{rate}%</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 모달 */}
      {showBudgetModal && (
        <BudgetEditModal
          currentBudget={budget.totalBudget}
          onSave={handleBudgetSave}
          onCancel={() => setShowBudgetModal(false)}
        />
      )}
      {showEventModal && (
        <EventAddModal
          onSave={handleEventAdd}
          onCancel={() => setShowEventModal(false)}
        />
      )}

    </div>
  );
}

export default BudgetPage;