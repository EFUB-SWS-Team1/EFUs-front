import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./EventForm.module.css";

function parseNumber(value) {
  return Number(String(value).replace(/,/g, "")) || 0;
}

function toDateString(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function EventForm({ title, initialValues, submitLabel, onCancel, onSubmit }) {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [participants, setParticipants] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(initialValues?.name ?? "");
    setBudget(String(initialValues?.budget ?? ""));
    setParticipants(String(initialValues?.participants ?? ""));
    setStartDate(initialValues?.startDate ? new Date(initialValues.startDate) : null);
    setEndDate(initialValues?.endDate ? new Date(initialValues.endDate) : null);
    setError("");
  }, [initialValues]);

  const isValid = name.trim() && parseNumber(budget) > 0;

  function handleDateChange(dates) {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    Promise.resolve(
      onSubmit({
        name: name.trim(),
        budget: parseNumber(budget),
        participants: parseNumber(participants) || 0,
        startDate: toDateString(startDate),
        endDate: toDateString(endDate ?? startDate),
      }),
    ).catch((err) => setError(err.message));
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{title}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="event-name">
            행사명 <span className={styles.required}>*</span>
          </label>
          <input
            id="event-name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="9월 MT"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="event-budget">
            예산 <span className={styles.required}>*</span>
          </label>
          <input
            id="event-budget"
            className={styles.input}
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^\d,]/g, ""))}
            placeholder="500,000"
            inputMode="numeric"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="event-participants">
            참여 인원
          </label>
          <input
            id="event-participants"
            className={styles.input}
            value={participants}
            onChange={(e) => setParticipants(e.target.value.replace(/\D/g, ""))}
            placeholder="30"
            inputMode="numeric"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>날짜</label>
          <div className={styles.datePickerWrap}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              locale={ko}
              dateFormat="yyyy.MM.dd"
              placeholderText="날짜를 선택하세요"
              isClearable
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </button>
          <button type="submit" className={styles.submitBtn} disabled={!isValid}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}