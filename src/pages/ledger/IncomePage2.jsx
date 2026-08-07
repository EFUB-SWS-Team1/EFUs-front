import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, ChevronUp, Search, Check } from "lucide-react";
import "./IncomePage2.css";
import {
  buildChargeAssignment,
  createCharge,
  getCharge,
  getChargeFundings,
  getChargeMembers,
  getChargePaymentMembers,
  previewCharge,
  updateCharge,
} from "../../api";
import useGroup from "../../hooks/useGroup";

const IncomePage2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTermId } = useGroup();
  const chargeId = location.state?.chargeId ?? location.state?.incomeData?.id;
  const isEditMode = chargeId != null;

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
  const [preview, setPreview] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [eventOptions, setEventOptions] = useState([]);
  const [original, setOriginal] = useState(null);
  const [hasPaidMembers, setHasPaidMembers] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadMembers() {
      setIsLoadingMembers(true);
      try {
        if (currentTermId == null) {
          if (!ignore) setMemberList([]);
          return;
        }
        const [members, fundings] = await Promise.all([
          getChargeMembers(currentTermId),
          getChargeFundings(currentTermId),
        ]);
        if (!ignore) {
          setMemberList(members);
          setEventOptions(fundings);
        }
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
  }, [currentTermId]);

  useEffect(() => {
    if (!isEditMode) return;
    let ignore = false;
    Promise.all([getCharge(chargeId), getChargePaymentMembers(chargeId)])
      .then(([detail, members]) => {
        if (ignore) return;
        const method = detail.chargeMethod ?? "PER_PERSON";
        const selectedIds = (detail.targetTermMemberIds ?? members.map((m) => m.termMemberId)).filter(Boolean);
        const next = {
          title: detail.title ?? "",
          amount: String(detail.perPersonAmount ?? detail.totalAmount ?? detail.requestedAmount ?? ""),
          date: String(detail.dueDate ?? "").slice(0, 10),
          event: detail.fundingId == null ? "" : String(detail.fundingId),
          memo: detail.memo ?? "",
        };
        setBillingType(method === "EQUAL_SPLIT" ? "nppang" : "individual");
        setSelectedTargets(selectedIds);
        setFormData(next);
        setOriginal({ ...detail, formData: next, selectedTargets: selectedIds });
        setHasPaidMembers(
          Number(detail.paidCount ?? 0) > 0 || members.some((m) => m.status === "completed"),
        );
      })
      .catch((err) => setSubmitError(err.response?.data?.message ?? err.message ?? "청구 정보를 불러오지 못했습니다."));
    return () => { ignore = true; };
  }, [chargeId, isEditMode]);

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
    setFormData((prev) => ({ ...prev, event: String(option.id) }));
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

  const rawAmount =
    parseInt(String(formData.amount).replace(/[^0-9]/g, ""), 10) || 0;
  const isAllSelected =
    memberList.length > 0 && selectedTargets.length === memberList.length;
  const canPreview =
    currentTermId != null && rawAmount > 0 && selectedTargets.length > 0;
  const previewKey = [
    currentTermId,
    billingType,
    isAllSelected ? "ALL_ACTIVE" : "SELECTED",
    rawAmount,
    selectedTargets.join(","),
  ].join(":");

  useEffect(() => {
    if (!canPreview) return;

    let ignore = false;
    const timer = window.setTimeout(async () => {
      setIsPreviewLoading(true);
      setPreviewError("");
      try {
        const result = await previewCharge(currentTermId, buildChargeAssignment({
          chargeMethod: billingType === "individual" ? "PER_PERSON" : "EQUAL_SPLIT",
          targetMode: isAllSelected ? "ALL_ACTIVE" : "SELECTED",
          targetTermMemberIds: selectedTargets,
          amount: rawAmount,
        }));
        if (!ignore) setPreview({ key: previewKey, data: result });
      } catch (err) {
        if (!ignore) {
          setPreview(null);
          setPreviewError(err.message ?? "청구 금액을 미리 계산하지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsPreviewLoading(false);
      }
    }, 300);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [billingType, canPreview, currentTermId, isAllSelected, previewKey, rawAmount, selectedTargets]);

  const activePreview = canPreview && preview?.key === previewKey
    ? preview.data
    : null;
  const equalSplitAssignedAmounts = activePreview?.members
    ?.map((member) => Number(member.assignedAmount))
    .filter(Number.isFinite);
  const previewDisplayAmount = billingType === "nppang"
    ? equalSplitAssignedAmounts?.length > 0
      ? Math.min(...equalSplitAssignedAmounts)
      : null
    : activePreview?.requestedAmount ?? activePreview?.totalAmount;
  const formattedTotalAmount = previewDisplayAmount != null
    ? `${Number(previewDisplayAmount).toLocaleString()}원`
    : "- 원";

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
    if (currentTermId == null) {
      setSubmitError("선택된 기수 정보를 확인해주세요.");
      return;
    }

    const assignment = buildChargeAssignment({
      chargeMethod: billingType === "individual" ? "PER_PERSON" : "EQUAL_SPLIT",
      targetMode: isAllSelected ? "ALL_ACTIVE" : "SELECTED",
      targetTermMemberIds: selectedTargets,
      amount: rawAmount,
    });
    const payload = {
      title: formData.title.trim(),
      dueDate: formData.date,
      fundingId: formData.event ? Number(formData.event) : null,
      memo: formData.memo || null,
      ...assignment,
    };

    try {
      setIsSubmitting(true);
      setSubmitError("");

      if (isEditMode) {
        const editablePayload = hasPaidMembers
          ? { title: payload.title, dueDate: payload.dueDate, fundingId: payload.fundingId, memo: payload.memo }
          : payload;
        const changedPayload = Object.fromEntries(Object.entries(editablePayload).filter(([key, value]) => {
          const previous = key === "dueDate" ? original?.dueDate
            : key === "fundingId" ? original?.fundingId
              : key === "memo" ? (original?.memo ?? null)
                : key === "title" ? original?.title
                  : undefined;
          return previous === undefined || JSON.stringify(previous) !== JSON.stringify(value);
        }));
        if (Object.keys(changedPayload).length > 0) await updateCharge(chargeId, changedPayload);
        navigate("/income-detail2", { state: { incomeData: { id: chargeId } }, replace: true });
        return;
      }

      const created = await createCharge(currentTermId, payload);
      const createdChargeId = created.id ?? created.chargeId;

      const today = new Date();
      const formattedDate = `${today.getFullYear()}.${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}`;

      const incomeData = {
        id: createdChargeId,
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
      setSubmitError(err.response?.data?.message ?? err.message ?? "회비 청구 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-container income-charge-container">
      <h2 className="expense-title">수입 (+)</h2>

      <div className="billing-type-container">
        <div
          className={`billing-card ${billingType === "individual" ? "active" : ""}`}
          onClick={() => !hasPaidMembers && setBillingType("individual")}
        >
          <div className="billing-card-header">
            <span className="custom-radio"></span>
            <span className="billing-card-title">개별 청구</span>
          </div>
          <p className="billing-card-desc">1인당 금액을 직접 지정</p>
        </div>

        <div
          className={`billing-card ${billingType === "nppang" ? "active" : ""}`}
          onClick={() => !hasPaidMembers && setBillingType("nppang")}
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
              disabled={hasPaidMembers}
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
              <span>{eventOptions.find((option) => String(option.id) === formData.event)?.name ?? ""}</span>
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
                    key={option.id}
                    className={formData.event === String(option.id) ? "selected" : ""}
                    onClick={() => handleSelectEvent(option)}
                  >
                    {option.name}
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
              disabled={hasPaidMembers}
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
                      style={hasPaidMembers ? { pointerEvents: "none", opacity: 0.65 } : undefined}
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
            <div className="total-billing-title">
              {billingType === "nppang" ? "1인당 청구 금액" : "전체 청구 금액"}
            </div>
            <div className="total-billing-formula">
              {billingType === "individual"
                ? "1인당 금액 × 인원 수"
                : `${rawAmount.toLocaleString()}원 ÷ ${activePreview?.targetCount ?? selectedTargets.length}명`}
            </div>
          </div>
          <div className="total-billing-value">{formattedTotalAmount}</div>
        </div>

        {canPreview && isPreviewLoading && <p className="preview-message">금액 계산 중...</p>}
        {canPreview && previewError && <p className="preview-message error">{previewError}</p>}

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
            {isSubmitting ? "저장 중..." : isEditMode ? "저장" : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomePage2;
