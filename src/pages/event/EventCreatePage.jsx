import { useNavigate } from 'react-router-dom';
import { createEvent } from "../../api";
import useGroup from "../../hooks/useGroup";
import EventForm from './components/EventForm';
import styles from './components/EventForm.module.css';


export default function EventCreatePage() {
  const { currentTermId: GENERATION_ID } = useGroup();
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
