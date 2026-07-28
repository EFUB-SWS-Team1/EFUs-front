import EventForm from "./EventForm";
import styles from "./EventFormModal.module.css";

export default function EventFormModal({
  isOpen,
  title,
  initialValues,
  submitLabel,
  onClose,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <EventForm
          title={title}
          initialValues={initialValues}
          submitLabel={submitLabel}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}