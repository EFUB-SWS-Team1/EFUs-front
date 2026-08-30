import { useEffect, useState } from "react";
import logoIcon from "../../assets/efub로고2.svg";
import pencilIcon from "../../assets/Edit_Pencil_Line_01.svg";
import { getDashboard, updateTerm } from "../../api";
import useGroup from "../../hooks/useGroup";
import BudgetSummary from "./components/BudgetSummary";
import RecentTransaction from "./components/RecentTransaction";
import EventSummary from "./components/EventSummary";
import TermEditModal from "./components/TermEditModal";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { currentTermId, isGroupLoading, refreshTerms } = useGroup();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    let ignore = false;

    if (isGroupLoading || currentTermId == null) {
      return () => {
        ignore = true;
      };
    }

    async function fetchDashboard() {
      setIsLoading(true);
      setError(null);
      setDashboard(null);

      try {
        const result = await getDashboard(currentTermId);
        if (!ignore) setDashboard(result);
      } catch (requestError) {
        if (!ignore) setError(requestError);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, [currentTermId, isGroupLoading]);

  async function handleSaveTermName(name) {
    setIsSubmitting(true);
    setEditError(null);

    try {
      await updateTerm(currentTermId, { name });
      const result = await getDashboard(currentTermId);
      setDashboard(result);
      await refreshTerms();
      setIsEditOpen(false);
    } catch (requestError) {
      setEditError(
        requestError.response?.data?.message ??
          requestError.message ??
          "기수명을 수정하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isGroupLoading || isLoading) {
    return <div className={styles.statusText}>불러오는 중...</div>;
  }

  if (currentTermId == null) {
    return <div className={styles.statusText}>조회할 기수를 선택해 주세요.</div>;
  }

  if (error || !dashboard) {
    return (
      <div className={`${styles.statusText} ${styles.errorText}`}>
        대시보드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  const { term, financialSummary, recentLedgerEntries, fundingBudgets } = dashboard;
  const isClosed = term.status === "CLOSED";
  const canEdit = term.status === "ACTIVE" && term.myRole === "STAFF";
  const termName = [term.organizationName, term.name].filter(Boolean).join(" ");

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <span className={styles.titleIcon} aria-hidden="true">
          <img src={logoIcon} alt="" />
        </span>
        <h1 className={styles.title}>
          <span className={styles.titleHighlight}>{termName}</span>
          <span className={styles.titleSuffixWrap}>
            <span className={styles.titleSuffix}>공동 가계부입니다</span>
            {canEdit && (
              <button
                type="button"
                className={styles.editButton}
                aria-label="기수명 수정"
                onClick={() => {
                  setEditError(null);
                  setIsEditOpen(true);
                }}
              >
                <img src={pencilIcon} alt="" />
              </button>
            )}
          </span>
        </h1>
        {isClosed && <span className={styles.readOnlyText}>읽기 전용 · 수정 불가</span>}
      </div>

      <BudgetSummary summary={financialSummary} />
      <RecentTransaction entries={recentLedgerEntries} />
      <EventSummary budgets={fundingBudgets} />

      <TermEditModal
        isOpen={isEditOpen}
        currentName={term.name}
        isSubmitting={isSubmitting}
        errorMessage={editError}
        onClose={() => {
          if (!isSubmitting) setIsEditOpen(false);
        }}
        onSubmit={handleSaveTermName}
      />
    </div>
  );
}