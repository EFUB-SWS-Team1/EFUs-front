import {
  useEffect,
  useState,
} from "react";

import { formatCurrency } from "../../utils/format";
import { Button } from "../../components/common";
import SummaryCard from "./components/SummaryCard";
import EventItem from "./components/EventItem";
import EventFormModal from "./components/EventFormModal";
import styles from "./EventPage.module.css";
import eventIcon from "../../assets/efub로고2.svg";
import plusIcon from "../../assets/plusIcon.svg";
import {
  createEvent,
  getEvents,
} from "../../api";
import useGroup from "../../hooks/useGroup";

export default function EventPage() {
  const {
    currentTermId,
    isGroupLoading,
  } = useGroup();

  const [summary, setSummary] =
    useState(null);
  const [events, setEvents] =
    useState([]);
  const [isCreateOpen, setIsCreateOpen] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  useEffect(() => {
  let ignore = false;

  if (
    isGroupLoading ||
    currentTermId == null
  ) {
    return undefined;
  }

  async function loadEvents() {
    setIsLoading(true);
    setError("");

    try {
      const data =
        await getEvents(currentTermId);

      if (ignore) return;

      setSummary(data.summary);
      setEvents(data.events);
    } catch (requestError) {
      if (ignore) return;

      setSummary(null);
      setEvents([]);

      setError(
        requestError?.response?.data
          ?.message ??
          requestError?.message ??
          "행사 목록을 불러오지 못했습니다.",
      );
    } finally {
      if (!ignore) {
        setIsLoading(false);
      }
    }
  }

  loadEvents();

  return () => {
    ignore = true;
  };
}, [currentTermId, isGroupLoading]);

  async function handleCreate(payload) {
  if (currentTermId == null) {
    setError(
      "행사를 등록할 기수를 선택해주세요.",
    );
    return;
  }

  try {
    setError("");

    await createEvent(
      currentTermId,
      payload,
    );

    const data =
      await getEvents(currentTermId);

    setSummary(data.summary);
    setEvents(data.events);
    setIsCreateOpen(false);
  } catch (requestError) {
    setError(
      requestError?.response?.data
        ?.message ??
        requestError?.message ??
        "행사 등록에 실패했습니다.",
    );
  }
}

  if (isGroupLoading) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>
          불러오는 중...
        </p>
      </div>
    );
  }

  if (currentTermId == null) {
    return (
      <div className={styles.page}>
        <p className={styles.empty}>
          조회할 기수를 선택해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img
          src={eventIcon}
          alt=""
          className={styles.headerIcon}
        />

        <h1 className={styles.title}>
          행사
        </h1>
      </header>

      {isLoading && (
        <p className={styles.empty}>
          불러오는 중...
        </p>
      )}

      {error && (
        <p
          className={styles.empty}
          style={{ color: "red" }}
        >
          {error}
        </p>
      )}

      {!isLoading && summary && (
        <div className={styles.summaryRow}>
          <SummaryCard
            label="총 예산"
            value={formatCurrency(
              summary.totalBudget,
            )}
          />

          <SummaryCard
            label="총 지출"
            value={formatCurrency(
              summary.totalSpent,
            )}
          />

          <SummaryCard
            label="잔액"
            value={formatCurrency(
              summary.balance,
            )}
          />
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          행사별 예산
        </h2>

        <Button
          variant="primary"
          icon={
            <img
              src={plusIcon}
              alt=""
              className={
                styles.addBtnIcon
              }
            />
          }
          className={styles.addBtn}
          disabled={isLoading}
          onClick={() =>
            setIsCreateOpen(true)
          }
        >
          행사 등록
        </Button>
      </div>

      {!isLoading &&
        !error &&
        events.length === 0 && (
          <p className={styles.empty}>
            등록된 행사가 없습니다.
          </p>
        )}

      {!isLoading &&
        !error &&
        events.length > 0 && (
          <ul className={styles.eventList}>
            {events.map((event) => (
              <li key={event.id}>
                <EventItem event={event} />
              </li>
            ))}
          </ul>
        )}

      <EventFormModal
        isOpen={isCreateOpen}
        title="행사 등록"
        submitLabel="등록"
        onClose={() =>
          setIsCreateOpen(false)
        }
        onSubmit={handleCreate}
      />
    </div>
  );
}