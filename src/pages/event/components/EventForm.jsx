import { forwardRef, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Input } from "../../../components/common";
import styles from "./EventForm.module.css";
import calendarIcon from "../../../assets/Calendar.svg";

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

const DateInput = forwardRef(function DateInput(
  { value, onClick, placeholder },
  ref,
) {
  return (
    <button type="button" className={styles.dateInputButton} onClick={onClick} ref={ref}>
      <img src={calendarIcon} alt="" className={styles.calendarIcon} />
      <span className={value ? styles.dateValue : styles.datePlaceholder}>
        {value || placeholder}
      </span>
    </button>
  );
});

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
        <Input
          label="행사명 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="9월 MT"
        />

        <Input
          label="예산 *"
          value={budget}
          onChange={(e) => setBudget(e.target.value.replace(/[^\d,]/g, ""))}
          placeholder="500,000"
          inputMode="numeric"
        />

        <Input
          label="참여 인원"
          value={participants}
          onChange={(e) => setParticipants(e.target.value.replace(/\D/g, ""))}
          placeholder="30"
          inputMode="numeric"
        />

        <div className={styles.dateField}>
          <label className={styles.dateLabel}>날짜</label>
          <div className={styles.datePickerWrap}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={handleDateChange}
              locale={ko}
              dateFormat="yyyy.MM.dd"
              placeholderText="날짜를 선택하세요"
              customInput={<DateInput placeholder="날짜를 선택하세요" />}
              popperClassName={styles.datePopper}
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" className={styles.cancelBtn} onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={!isValid}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}