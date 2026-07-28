import { useEffect, useMemo, useState } from "react";
import { Input } from "../../../components/common";
import { formatDate } from "../../../utils/format";
import styles from "./GenerationCloseModal.module.css";
import calendarIcon from "../../../assets/Calendar.svg";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    cells.push({ day: daysInPrevMonth - i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ day: d, outside: false });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, outside: true });
  }

  return cells;
}

export default function GenerationCloseModal({
  isOpen,
  generationLabel,
  onClose,
  onSubmit,
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedDate("");
      setShowCalendar(false);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
  }, [isOpen]);

  const calendar = useMemo(
    () => buildCalendar(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  if (!isOpen) return null;

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleSelectDay(day, outside) {
    if (outside) return;
    const dateStr = toDateStr(viewYear, viewMonth, day);
    setSelectedDate(dateStr);
    setShowCalendar(false);
  }

  async function handleSubmit() {
    if (!selectedDate) return;
    setSubmitting(true);
    try {
      await onSubmit(selectedDate);
    } finally {
      setSubmitting(false);
    }
  }

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString("en-US", {
    month: "short",
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>기수 종료</h2>

        <Input label="기수 *" value={generationLabel} readOnly />

        <div className={styles.dateField}>
          <label className={styles.dateLabel}>종료일 *</label>
          <button
            type="button"
            className={styles.dateInput}
            onClick={() => setShowCalendar((prev) => !prev)}
          >
            <img
              src={calendarIcon}
              alt=""
              className={styles.calendarIcon}
              aria-hidden="true"
            />
            <span
              className={
                selectedDate ? styles.dateValue : styles.datePlaceholder
              }
            >
              {selectedDate ? formatDate(selectedDate) : "날짜 선택"}
            </span>
          </button>

          {showCalendar && (
            <div className={styles.calendar}>
              <div className={styles.calHeader}>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="이전 달"
                >
                  ‹
                </button>
                <span>
                  {monthLabel} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="다음 달"
                >
                  ›
                </button>
              </div>

              <div className={styles.weekdays}>
                {WEEKDAYS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              <div className={styles.days}>
                {calendar.map((cell, idx) => {
                  const dateStr = cell.outside
                    ? null
                    : toDateStr(viewYear, viewMonth, cell.day);
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={idx}
                      type="button"
                      className={[
                        styles.day,
                        cell.outside ? styles.dayOutside : "",
                        isSelected ? styles.daySelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelectDay(cell.day, cell.outside)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <p className={styles.notice}>
          기록을 종료하면 수정 없이 열람만 가능해요
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            disabled={!selectedDate || submitting}
            onClick={handleSubmit}
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
}
