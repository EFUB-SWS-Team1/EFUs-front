import { useEffect, useState } from "react";
import logoIcon from "../../assets/efub로고1.svg";
import pencilIcon from "../../assets/Edit_Pencil_Line_01.svg";
import { getDashboardSummary } from "../../api/dashboard";
import useGroup from "../../hooks/useGroup";
import BudgetSummary from "./components/BudgetSummary";
import RecentTransaction from "./components/RecentTransaction";
import EventSummary from "./components/EventSummary";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { currentGeneration } = useGroup();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getDashboardSummary(currentGeneration.id);
        if (!ignore) setData(result);
      } catch (err) {
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, [currentGeneration.id]);

  if (isLoading) {
    return <div className={styles.statusText}>불러오는 중...</div>;
  }

  if (error || !data) {
    return (
      <div className={`${styles.statusText} ${styles.errorText}`}>
        대시보드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
      </div>
    );
  }

  const { generation, summary, recentTransactions, events } = data;

  return (
    <div className={styles.page}>
      {/* 타이틀 영역: 현재 기수는 수정 아이콘, 지난 기수는 기간 + 읽기 전용 표시 */}
      <div className={styles.titleRow}>
        {/* TODO: 디자이너 SVG 받으면 아이콘으로 교체 */}
        <span className={styles.titleIcon} aria-hidden="true">
            <img src={logoIcon} alt="../../assets/efub로고1.svg" aria-hidden="true" className={styles.titleIcon} />
        </span>
        <h1 className={styles.title}>
          {generation.name}
          <span className={styles.titleSuffix}> 의 공동 가계부입니다</span>
        </h1>

        {generation.isCurrent ? (
          <button type="button" className={styles.editButton} aria-label="가계부 이름 수정">
  <img src={pencilIcon} alt="" />
</button>
        ) : (
          <span className={styles.readOnlyText}>
            {generation.period} · 읽기 전용 · 수정 불가
          </span>
        )}
      </div>

      <BudgetSummary summary={summary} />
      <RecentTransaction transactions={recentTransactions} />
      <EventSummary events={events} />
    </div>
  );
}
