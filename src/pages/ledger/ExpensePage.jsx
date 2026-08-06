import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import "./ExpensePage.css";
import FolderIcon from "../../assets/Folder plus.svg";
import { createTransaction, uploadReceipt } from "../../api";


const TERM_ID = 1;

const ExpensePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    event: "",
    memo: "",
    receipt: null,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEventAdded, setIsEventAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const dateInputRef = useRef(null);

  const eventOptions = [
    "2월 MT",
    "1학기 종강파티",
    "8월 MT",
    "여름방학 해커톤",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectEvent = (option) => {
    setFormData((prev) => ({ ...prev, event: option }));
    setIsDropdownOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, receipt: file }));
    }
  };

  const handleDateClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEventAdded) {
      if (!formData.event) {
        alert("행사를 선택해주세요.");
        return;
      }

      setFormData((prev) => ({
        title: "",
        amount: "",
        date: "",
        event: prev.event,
        memo: "",
        receipt: null,
      }));
      setIsEventAdded(true);
      return;
    }

    if (!formData.title || !formData.amount || !formData.date) {
      alert("내용, 금액, 날짜는 필수 입력입니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const amountNumber =
        Number(String(formData.amount).replace(/[^0-9]/g, "")) || 0;

      const created = await createTransaction(TERM_ID, {
        transactionType: "EXPENSE",
        title: formData.title.trim(),
        amount: amountNumber,
        transactionDate: formData.date,
        fundingId: null,
        memo: formData.memo || null,
      });

      const transactionId = created.id ?? created.transactionId;

      if (formData.receipt && transactionId) {
        await uploadReceipt(transactionId, formData.receipt);
      }

      const today = new Date();
      const formattedDate = `${today.getFullYear()}.${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

      const expenseData = {
        id: transactionId,
        title: formData.title,
        registrationDate: formattedDate,
        amount:
          `-${amountNumber}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원",
        date: formData.date,
        event: formData.event || "-",
        memo: formData.memo || "-",
        receipt: formData.receipt ? formData.receipt.name : null,
        history: [],
      };

      navigate("/expense-detail", { state: { expenseData } });
    } catch (err) {
      setSubmitError(err.message ?? "지출 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-container">
      <h2 className="expense-title">지출 (-)</h2>

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-row">
          <div className="form-group">
            <label>내용 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder=""
            />
          </div>

          <div className="form-group">
            <label>금액 *</label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder=""
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>날짜 *</label>
            <div className="custom-date-box" onClick={handleDateClick}>
              <Calendar className="calendar-icon-only" size={16} />
              <span className="selected-date-text">{formData.date}</span>
              <input
                ref={dateInputRef}
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
            <div
              className={`custom-select ${isDropdownOpen ? "open" : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{formData.event}</span>
              {isDropdownOpen ? (
                <ChevronUp className="icon dropdown-icon" size={18} />
              ) : (
                <ChevronDown className="icon dropdown-icon" size={18} />
              )}
            </div>

            {isDropdownOpen && (
              <ul className="dropdown-menu">
                {eventOptions.map((option) => (
                  <li
                    key={option}
                    className={formData.event === option ? "selected" : ""}
                    onClick={() => handleSelectEvent(option)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label>메모</label>
          <input
            type="text"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            placeholder=""
          />
        </div>

        <div className="form-group full-width">
          <label>영수증</label>
          <label htmlFor="receipt-upload" className="file-upload-area">
            <div className="folder-icon-wrapper">
              <img src={FolderIcon} alt="폴더 아이콘" className="folder-svg" />
            </div>
            <span className="upload-text">
              {formData.receipt
                ? formData.receipt.name
                : "OCR 금액 자동 인식 · JPG, PNG"}
            </span>
            <input
              id="receipt-upload"
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {submitError && <p style={{ color: "red" }}>{submitError}</p>}

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
            className={`btn btn-submit ${isEventAdded ? "register-mode" : "add-mode"}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "등록 중..." : isEventAdded ? "등록" : "추가"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpensePage;
