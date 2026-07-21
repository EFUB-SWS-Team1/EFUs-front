import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/event';
import EventForm from './components/EventForm';
import styles from './components/EventForm.module.css';

const GENERATION_ID = 'efub-6';

export default function EventCreatePage() {
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    await createEvent(GENERATION_ID, payload);
    navigate('/events');
  }

  return (
    <div className={styles.formPage}>
      <div className={styles.topBar}>
        <button type="button" className={styles.backBtn} onClick={() => navigate('/events')}>
          ← 행사 목록으로
        </button>
      </div>

      <EventForm
        title="행사 등록"
        submitLabel="등록"
        onCancel={() => navigate('/events')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}