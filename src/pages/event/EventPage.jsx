import { useEffect, useState } from "react";
import { createEvent, getEvents } from "../../api/event";
import { formatCurrency } from "../../utils/format";
import SummaryCard from "./components/SummaryCard";
import EventItem from "./components/EventItem";
import EventFormModal from "./components/EventFormModal";
import styles from "./EventPage.module.css";
import eventIcon from "../../assets/efub로고2.svg";

const GENERATION_ID = "efub-6";

export default function EventPage() {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  function loadEvents() {
    getEvents(GENERATION_ID).then((data) => {
      setSummary(data.summary);
      setEvents(data.events);
    });
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreate(payload) {
    await createEvent(GENERATION_ID, payload);
    setIsCreateOpen(false);
    loadEvents();
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src={eventIcon} alt="" className={styles.headerIcon} />
        <h1 className={styles.title}>행사</h1>
      </header>

      {summary && (
        <div className={styles.summaryRow}>
          <SummaryCard label="총 예산" value={formatCurrency(summary.totalBudget)} />
          <SummaryCard label="총 지출" value={formatCurrency(summary.totalSpent)} />
          <SummaryCard label="잔액" value={formatCurrency(summary.balance)} />
        </div>
      )}

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>행사별 예산</h2>
        <button type="button" className={styles.addBtn} onClick={() => setIsCreateOpen(true)}>
          + 행사 등록
        </button>
      </div>

      {events.length === 0 ? (
        <p className={styles.empty}>등록된 행사가 없습니다.</p>
      ) : (
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
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}