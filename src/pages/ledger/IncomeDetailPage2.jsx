import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import "./IncomeDetailPage2.css";
import backArrowIcon from "../../assets/화살표.svg";
import {
  bulkPayCharge,
  deleteCharge,
  getCharge,
  getChargeHistories,
  getChargePaymentMembers,
  payChargeMember,
  reverseChargeMemberPayment,
} from "../../api";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";
  return String(dateStr).slice(0, 10).replaceAll("-", ".");
}

function formatWon(amount) {
  const num = Math.abs(Number(amount) || 0);
  return `${num.toLocaleString()}원`;
}

function mapChargeToView(data, fallback = {}) {
  return {
    id: data.id ?? data.chargeId ?? fallback.id,
    title: data.title ?? fallback.title ?? "",
    registrationDate:
      formatDisplayDate(data.createdAt ?? data.registrationDate) ||
      fallback.registrationDate ||
      "-",
    amount: formatWon(
      data.requestedAmount ?? data.totalAmount ?? fallback.rawAmount ?? 0,
    ),
    date: formatDisplayDate(data.dueDate ?? data.date) || fallback.date || "-",
    event: data.fundingName ?? data.event ?? fallback.event ?? "-",
    memo: data.memo || fallback.memo || "-",
    history: fallback.history ?? [],
    isDeleted: data.deleted ?? data.isDeleted ?? false,
    deletedDate: formatDisplayDate(data.deletedAt ?? data.deletedDate) || null,
    paidAmount: data.paidAmount ?? 0,
    unpaidAmount: data.unpaidAmount ?? 0,
    paidCount: data.paidCount ?? null,
    unpaidCount: data.unpaidCount ?? null,
  };
}

const IncomeDetailPage2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initial = location.state?.incomeData;

  const [incomeData, setIncomeData] = useState(
    initial || {
      id: null,
      title: "9월 정기 회비",
      registrationDate: "2026.10.17",
      amount: "500,000원",
      date: "2026.09.09",
      event: "-",
      memo: "-",
      history: [],
      isDeleted: false,
      deletedDate: null,
      paidAmount: 0,
    },
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberList, setMemberList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const chargeId = initial?.id ?? incomeData.id;

  async function reloadMembers(id) {
    const members = await getChargePaymentMembers(id);
    setMemberList(members);
  }

  useEffect(() => {
    if (!chargeId) return;

    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [detail, histories, members] = await Promise.all([
          getCharge(chargeId),
          getChargeHistories(chargeId),
          getChargePaymentMembers(chargeId),
        ]);

        if (ignore) return;

        setIncomeData(
          mapChargeToView(detail, {
            ...initial,
            id: chargeId,
            history: histories,
          }),
        );
        setMemberList(members);
      } catch (err) {
        if (!ignore) {
          setError(err.message ?? "회비 상세를 불러오지 못했습니다.");
          // 등록 직후 state만 있어도 화면은 보이게
          if (initial) setIncomeData((prev) => ({ ...prev, id: chargeId }));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeId]);

  const handleStatusToggle = async (id) => {
    if (!chargeId || incomeData.isDeleted) return;

    const target = memberList.find((m) => m.id === id);
    if (!target) return;

    try {
      setError("");
      if (target.status === "pending") {
        await payChargeMember(chargeId, id);
      } else {
        await reverseChargeMemberPayment(chargeId, id);
      }
      await reloadMembers(chargeId);
      const detail = await getCharge(chargeId);
      setIncomeData((prev) =>
        mapChargeToView(detail, { ...prev, history: prev.history }),
      );
    } catch (err) {
      setError(err.message ?? "납부 상태 변경에 실패했습니다.");
    }
  };

  const handleAllComplete = async () => {
    if (!chargeId || incomeData.isDeleted) return;

    try {
      setError("");
      await bulkPayCharge(chargeId, { targetMode: "ALL_UNPAID" });
      await reloadMembers(chargeId);
      const detail = await getCharge(chargeId);
      setIncomeData((prev) =>
        mapChargeToView(detail, { ...prev, history: prev.history }),
      );
    } catch (err) {
      setError(err.message ?? "전체 납부 처리에 실패했습니다.");
    }
  };

  const completedCount = memberList.filter(
    (m) => m.status === "completed",
  ).length;
  const pendingCount = memberList.filter((m) => m.status === "pending").length;

  const paidAmountSum = useMemo(() => {
    if (incomeData.paidAmount != null && incomeData.paidAmount !== 0) {
      return formatWon(incomeData.paidAmount);
    }
    const sum = memberList
      .filter((m) => m.status === "completed")
      .reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
    return formatWon(sum);
  }, [incomeData.paidAmount, memberList]);

  const filteredMembers = memberList.filter((m) =>
    m.name.includes(searchTerm.trim()),
  );

  const handleDeleteConfirm = async () => {
    if (!chargeId) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await deleteCharge(chargeId);
      const today = formatDisplayDate(new Date().toISOString());
      setIncomeData((prev) => ({
        ...prev,
        isDeleted: true,
        deletedDate: today,
        history: [
          { date: today, author: "나", content: "삭제" },
          ...(prev.history ?? []),
        ],
      }));
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(err.message ?? "삭제에 실패했습니다.");
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="detail-container">
      <div className="detail-top-nav">
        <button className="btn-back" onClick={() => navigate("/ledger")}>
          <img src={backArrowIcon} alt="뒤로가기" className="back-arrow-svg" />{" "}
          가계부 목록으로
        </button>
        <div className="action-buttons">
          {/* 회비 수정 화면이 따로 없으면 일단 비활성/또는 기존 경로 유지 */}
          <button
            className="btn-action btn-edit"
            onClick={() => navigate("/income-edit", { state: { incomeData } })}
            disabled={incomeData.isDeleted}
          >
            수정
          </button>
          <button
            className="btn-action btn-delete"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={incomeData.isDeleted}
          >
            삭제
          </button>
        </div>
      </div>

      {isLoading && <p>불러오는 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="detail-header-section">
        <div
          className="title-area"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <h1
            className={`detail-main-title ${incomeData.isDeleted ? "deleted-text" : ""}`}
          >
            {incomeData.title}
          </h1>
          {incomeData.isDeleted ? (
            <p className="deleted-date-text" style={{ margin: 0 }}>
              삭제된 날짜 {incomeData.deletedDate}
            </p>
          ) : (
            <p className="detail-reg-date" style={{ margin: 0 }}>
              등록된 날짜 {incomeData.registrationDate}
            </p>
          )}
        </div>
        <div
          className={`detail-amount ${incomeData.isDeleted ? "deleted-text" : ""}`}
        >
          {incomeData.amount}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">내용</span>
            <span className="value">{incomeData.title}</span>
          </div>
          <div className="detail-item">
            <span className="label">금액</span>
            <span className="value">{incomeData.amount}</span>
          </div>
          <div className="detail-item">
            <span className="label">날짜</span>
            <span className="value">{incomeData.date}</span>
          </div>
          <div className="detail-item">
            <span className="label">행사</span>
            <span className="value">{incomeData.event}</span>
          </div>
          <div className="detail-item full-width">
            <span className="label">메모</span>
            <span className="value">{incomeData.memo}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="section-heading">수정 이력</h3>
        <div className="section-box">
          {incomeData.history && incomeData.history.length > 0 ? (
            <table className="history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>이름</th>
                  <th>수정 내용</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.author}</td>
                    <td>{item.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            "수정 이력이 없습니다"
          )}
        </div>
      </div>

      <div className="summary-cards-row">
        <div className="summary-card">
          <span className="summary-card-label">납부된 금액</span>
          <span className="summary-card-value">{paidAmountSum}</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">납부 완료</span>
          <span className="summary-card-value">{completedCount}명</span>
        </div>
        <div className="summary-card">
          <span className="summary-card-label">미납</span>
          <span className="summary-card-value">{pendingCount}명</span>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="payment-section-title" style={{ marginBottom: "16px" }}>
          납부 현황
        </h3>

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
            onClick={handleAllComplete}
            disabled={incomeData.isDeleted}
          >
            전체 납부 처리
          </button>
        </div>

        <div className="target-select-box">
          <div className="target-list-grid">
            {filteredMembers.map((member) => {
              const isCompleted = member.status === "completed";
              return (
                <div
                  key={member.id}
                  className={`target-item ${isCompleted ? "checked" : ""}`}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      className={`badge ${member.role === "운영진" ? "admin" : "general"}`}
                    >
                      {member.role}
                    </span>
                    <span className="target-name">{member.name}</span>
                  </div>
                  <button
                    type="button"
                    className={`status-badge-btn ${isCompleted ? "completed" : "pending"}`}
                    onClick={() => handleStatusToggle(member.id)}
                    disabled={incomeData.isDeleted}
                  >
                    {isCompleted ? "완료" : "미납"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pagination-mock">
            <span>1 / 1</span>
            <span className="page-arrow">&gt;</span>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>거래 삭제</h3>
            <p>{incomeData.title} 내역을 삭제합니다</p>
            <p className="modal-sub-text">
              거래를 삭제해도 삭제 이력까지 계속 보관돼요
            </p>
            <div className="modal-buttons">
              <button
                className="btn-modal-cancel"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                취소
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleDeleteConfirm}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeDetailPage2;
