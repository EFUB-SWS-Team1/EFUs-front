import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, ChevronUp, Search, Check } from "lucide-react";
import "./IncomePage2.css";
import { createCharge, getChargeMembers } from "../../api/charge/charge";

const TERM_ID = 1; // 나중에 실제 termId로

const IncomePage2 = () => {
  const navigate = useNavigate();

  const [billingType, setBillingType] = useState("individual"); // individual | nppang
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: "",
    event: "",
    memo: "",
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dateInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const eventOptions = [
    "2월 MT",
    "1학기 종강파티",
    "8월 MT",
    "여름방학 해커톤",
  ];

  useEffect(() => {
    let ignore = false;

    async function loadMembers() {
      setIsLoadingMembers(true);
      try {
        const members = await getChargeMembers(TERM_ID);
        if (!ignore) setMemberList(members);
      } catch (err) {
        if (!ignore) {
          setMemberList([]);
          setSubmitError(err.message ?? "멤버 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsLoadingMembers(false);
      }
    }

    loadMembers();
    return () => {
      ignore = true;
    };
  }, []);

  const sortedMemberList = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const filtered = keyword
      ? memberList.filter((m) => m.name.toLowerCase().includes(keyword))
      : memberList;

    return [...filtered].sort((a, b) => {
      if (a.role === "staff" && b.role !== "staff") return -1;
      if (a.role !== "staff" && b.role === "staff") return 1;
      return 0;
    });
  }, [memberList, searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectEvent = (option) => {
    setFormData((prev) => ({ ...prev, event: option }));
    setIsDropdownOpen(false);
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

  const handleTargetToggle = (id) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedTargets.length === memberList.length) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(memberList.map((m) => m.id));
    }
  };

  const calculateTotalAmount = () => {
    const rawAmount =
      parseInt(String(formData.amount).replace(/[^0-9]/g, ""), 10) || 0;
    if (billingType === "individual") {
      return rawAmount * selectedTargets.length;
    }
    return rawAmount;
  };

  const totalCalculated = calculateTotalAmount();
  const formattedTotalAmount =
    totalCalculated > 0 ? `${totalCalculated.toLocaleString()}원` : "- 원";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.date) {
      alert("내용, 금액, 날짜는 필수 입력입니다.");
      return;
    }
    if (selectedTargets.length === 0) {
      alert("청구 대상을 선택해주세요.");
      return;
    }

    const rawAmount =
      parseInt(String(formData.amount).replace(/[^0-9]/g, ""), 10) || 0;

    const isAllSelected =
      memberList.length > 0 && selectedTargets.length === memberList.length;

    const payload = {
      title: formData.title.trim(),
      chargeMethod: billingType === "individual" ? "PER_PERSON" : "EQUAL_SPLIT",
      dueDate: formData.date,
      fundingId: null, // TODO: 행사 → fundingId
      memo: formData.memo || null,
      targetMode: isAllSelected ? "ALL_ACTIVE" : "SELECTED",
      ...(isAllSelected
        ? {}
        : { targetTermMemberIds: selectedTargets }),
      ...(billingType === "individual"
        ? { perPersonAmount: rawAmount }
        : { totalAmount: rawAmount }),
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const created = await createCharge(TERM_ID, payload);
      const chargeId = created.id ?? created.chargeId;

      const today = new Date();
      const formattedDate = `${today.getFullYear()}.${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

      const incomeData = {
        id: chargeId,
        billingType,
        title: formData.title,
        registrationDate: formattedDate,
        amount: formattedTotalAmount,
        date: formData.date,
        event: formData.event || "-",
        memo: formData.memo || "-",
        targetCount: selectedTargets.length,
        history: [],
      };

      navigate("/income-detail2", { state: { incomeData } });
    } catch (err) {
      setSubmitError(err.message ?? "회비 청구 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-container">
      <h2 className="expense-title">수입 (+)</h2>

      <div className="billing-type-container">
        <div
          className={`billing-card ${billingType === "individual" ? "active" : ""}`}
          onClick={() => setBillingType("individual")}
        >
          <div className="billing-card-header">
            <span className="custom-radio"></span>
            <span className="billing-card-title">개별 청구</span>
          </div>
          <p className="billing-card-desc">1인당 금액을 직접 지정</p>
        </div>

        <div
          className={`billing-card ${billingType === "nppang" ? "active" : ""}`}
          onClick={() => setBillingType("nppang")}
        >
          <div className="billing-card-header">
            <span className="custom-radio"></span>
            <span className="billing-card-title">N빵 청구</span>
          </div>
          <p className="billing-card-desc">총 금액을 인원수로 균등 분할</p>
        </div>
      </div>

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
            <label>
              {billingType === "individual" ? "1인당 금액 *" : "총 금액 *"}
            </label>
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
          <label>청구 대상 *</label>

          <div className="target-search-row">
            <div className="target-search-input-wrap">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="     이름으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="target-search-input"
              />
            </div>
            <button
              type="button"
              className="btn-bulk-select"
              onClick={handleSelectAll}
            >
              전체 일괄 청구
            </button>
          </div>

          <div className="target-select-box">
            <div className="target-count-text">
              <strong>{selectedTargets.length}명</strong> 선택됨
            </div>

            {isLoadingMembers ? (
              <p>멤버 불러오는 중...</p>
            ) : (
              <div className="target-list-grid">
                {sortedMemberList.map((member) => {
                  const isChecked = selectedTargets.includes(member.id);
                  const roleLabel =
                    member.role === "staff" ? "운영진" : "일반";
                  return (
                    <div
                      key={member.id}
                      className={`target-item ${isChecked ? "checked" : ""}`}
                      onClick={() => handleTargetToggle(member.id)}
                    >
                      <div
                        className={`checkbox-custom ${isChecked ? "checked" : ""}`}
                      >
                        {isChecked && <Check size={12} color="#fff" />}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginRight: "auto",
                        }}
                      >
                        <span
                          className={`badge ${member.role === "staff" ? "admin" : "general"}`}
                        >
                          {roleLabel}
                        </span>
                        <span className="target-name">{member.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pagination-mock">
              <span>1 / 1</span>
              <span className="page-arrow">&gt;</span>
            </div>
          </div>
        </div>

        <div className="total-billing-summary-box">
          <div className="total-billing-left">
            <div className="total-billing-title">전체 청구 금액</div>
            <div className="total-billing-formula">
              {billingType === "individual"
                ? "1인당 금액 × 인원 수"
                : "N빵 총 분할 금액"}
            </div>
          </div>
          <div className="total-billing-value">{formattedTotalAmount}</div>
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
            className="btn btn-submit register-mode"
            disabled={isSubmitting}
          >
            {isSubmitting ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomePage2;