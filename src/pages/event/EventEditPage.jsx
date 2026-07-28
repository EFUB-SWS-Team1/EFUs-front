import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventDetail, updateEvent } from '../../api/event';
import EventForm from './components/EventForm';
import styles from './components/EventForm.module.css';

const GENERATION_ID = 'efub-6';

export default function EventEditPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEventDetail(GENERATION_ID, eventId)
      .then(({ event }) => setInitialValues(event))
      .finally(() => setLoading(false));
  }, [eventId]);

  async function handleSubmit(payload) {
    await updateEvent(GENERATION_ID, eventId, payload);
    navigate(`/events/${eventId}`);
  }

  if (loading) return <div className={styles.formPage}>불러오는 중...</div>;
  if (!initialValues) return <div className={styles.formPage}>행사를 찾을 수 없습니다.</div>;

  return (
    <div className={styles.formPage}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(`/events/${eventId}`)}>
          ← 행사 상세로
        </button>
      </div>

      <EventForm
        title="행사 수정"
        initialValues={initialValues}
        submitLabel="저장"
        onCancel={() => navigate(`/events/${eventId}`)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}