import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createTransaction,
  getEvents,
  getTransaction,
  updateTransaction,
  uploadReceipt,
} from "../../../api";
import FolderIcon from "../../../assets/Folder plus.svg";
import useGroup from "../../../hooks/useGroup";

const EMPTY_FORM = {
  title: "",
  amount: "",
  date: "",
  fundingId: "",
  memo: "",
  receipt: null,
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallback
  );
}

export default function TransactionForm({
  transactionType,
  mode,
  detailPath,
  containerClassName,
  formClassName,
  showTitle = false,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTermId, isGroupLoading } = useGroup();
  const transactionId = searchParams.get("transactionId");
  const hasMissingTransactionId =
    mode === "edit" && !transactionId;
  const dateInputRef = useRef(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [events, setEvents] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    if (isGroupLoading || currentTermId == null) {
      return undefined;
    }

    async function loadFormData() {
      setIsLoading(true);
      setError("");

      try {
        const [eventData, transaction] = await Promise.all([
          getEvents(currentTermId),
          mode === "edit"
            ? getTransaction(currentTermId, transactionId)
            : Promise.resolve(null),
        ]);

        if (ignore) return;

        setEvents(eventData.events);

        if (transaction) {
          setFormData({
            title: transaction.title ?? "",
            amount: String(transaction.amount ?? ""),
            date: transaction.transactionDate ?? "",
            fundingId:
              transaction.fundingId == null
                ? ""
                : String(transaction.fundingId),
            memo: transaction.memo ?? "",
            receipt: null,
          });
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(
              requestError,
              "거래 입력 정보를 불러오지 못했습니다.",
            ),
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (hasMissingTransactionId) {
      return undefined;
    }

    loadFormData();

    return () => {
      ignore = true;
    };
  }, [
    currentTermId,
    hasMissingTransactionId,
    isGroupLoading,
    mode,
    transactionId,
  ]);

  const selectedEvent = events.find(
    (event) => String(event.id) === String(formData.fundingId),
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSelectEvent(fundingId) {
    setFormData((previous) => ({
      ...previous,
      fundingId,
    }));
    setIsDropdownOpen(false);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0] ?? null;
    setFormData((previous) => ({
      ...previous,
      receipt: file,
    }));
  }

  function handleDateClick() {
    if (typeof dateInputRef.current?.showPicker === "function") {
      dateInputRef.current.showPicker();
      return;
    }

    dateInputRef.current?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(
      String(formData.amount).replace(/[^0-9]/g, ""),
    );

    if (!formData.title.trim() || amount <= 0 || !formData.date) {
      setError("내용, 0보다 큰 금액, 날짜는 필수 입력입니다.");
      return;
    }

    if (currentTermId == null) {
      setError("거래를 등록할 기수를 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const payload = {
        transactionType,
        title: formData.title,
        amount,
        transactionDate: formData.date,
        fundingId: formData.fundingId || null,
        memo: formData.memo || null,
      };
      const savedTransaction =
        mode === "edit"
          ? await updateTransaction(
              currentTermId,
              transactionId,
              payload,
            )
          : await createTransaction(currentTermId, payload);
      const savedId =
        savedTransaction?.transactionId ?? transactionId;

      if (formData.receipt && savedId) {
        await uploadReceipt(savedId, formData.receipt);
      }

      navigate(`${detailPath}?transactionId=${savedId}`);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          mode === "edit"
            ? "거래 수정에 실패했습니다."
            : "거래 등록에 실패했습니다.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (hasMissingTransactionId) {
    return (
      <div className={containerClassName}>
        수정할 거래 ID가 없습니다.
      </div>
    );
  }

  if (isGroupLoading || isLoading) {
    return <div className={containerClassName}>불러오는 중...</div>;
  }

  if (currentTermId == null) {
    return (
      <div className={containerClassName}>
        거래를 등록할 기수를 선택해주세요.
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {showTitle && (
        <h2 className="expense-title">
          {transactionType === "EXPENSE" ? "지출 (-)" : "수입 (+)"}
        </h2>
      )}

      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="transaction-title">내용 *</label>
            <input
              id="transaction-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="transaction-amount">금액 *</label>
            <input
              id="transaction-amount"
              type="text"
              inputMode="numeric"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="transaction-date">날짜 *</label>
            <div className="custom-date-box" onClick={handleDateClick}>
              <Calendar className="calendar-icon-only" size={16} />
              <span className="selected-date-text">{formData.date}</span>
              <input
                ref={dateInputRef}
                id="transaction-date"
                type="date"
                name="date"
                className="hidden-date-input"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group relative">
            <label>행사</label>
            <button
              type="button"
              className={`custom-select ${isDropdownOpen ? "open" : ""}`}
              onClick={() => setIsDropdownOpen((open) => !open)}
            >
              <span>{selectedEvent?.name ?? "행사 없음"}</span>
              {isDropdownOpen ? (
                <ChevronUp className="icon dropdown-icon" size={18} />
              ) : (
                <ChevronDown className="icon dropdown-icon" size={18} />
              )}
            </button>

            {isDropdownOpen && (
              <ul className="dropdown-menu">
                <li
                  className={formData.fundingId === "" ? "selected" : ""}
                  onClick={() => handleSelectEvent("")}
                >
                  행사 없음
                </li>
                {events.map((event) => (
                  <li
                    key={event.id}
                    className={
                      String(formData.fundingId) === String(event.id)
                        ? "selected"
                        : ""
                    }
                    onClick={() => handleSelectEvent(String(event.id))}
                  >
                    {event.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="transaction-memo">메모</label>
          <input
            id="transaction-memo"
            type="text"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label>영수증</label>
          <label htmlFor="receipt-upload" className="file-upload-area">
            <div className="folder-icon-wrapper">
              <img src={FolderIcon} alt="" className="folder-svg" />
            </div>
            <span className="upload-text">
              {formData.receipt?.name ?? "OCR 금액 자동 인식 · JPG, PNG"}
            </span>
            <input
              id="receipt-upload"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="button-group">
          <button
            type="button"
            className="btn btn-cancel"
            onClick={() => navigate(-1)}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-submit register-mode"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? mode === "edit"
                ? "저장 중..."
                : "등록 중..."
              : mode === "edit"
                ? "저장"
                : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
