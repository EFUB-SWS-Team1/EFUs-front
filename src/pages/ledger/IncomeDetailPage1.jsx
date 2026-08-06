import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./IncomeDetailPage1.css";
import backArrowIcon from "../../assets/화살표.svg";
import {
  deleteTransaction,
  getReceipt,
  getTransaction,
  getTransactionHistories,
} from "../../api";

function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";
  return String(dateStr).slice(0, 10).replaceAll("-", ".");
}

function formatAmount(amount, type = "INCOME") {
  const num = Math.abs(Number(amount) || 0);
  const formatted = num.toLocaleString();
  return type === "EXPENSE" ? `-${formatted}원` : `+${formatted}원`;
}

function mapTransactionToView(data, fallback = {}) {
  const type = String(data.transactionType ?? "INCOME").toUpperCase();
  return {
    id: data.id ?? data.transactionId ?? fallback.id,
    title: data.title ?? fallback.title ?? "",
    registrationDate:
      formatDisplayDate(data.createdAt ?? data.registrationDate) ||
      fallback.registrationDate ||
      "-",
    amount: formatAmount(data.amount ?? 0, type),
    date: formatDisplayDate(data.transactionDate ?? data.date),
    event: data.fundingName ?? data.event ?? fallback.event ?? "-",
    memo: data.memo || fallback.memo || "-",
    receipt: fallback.receipt ?? null,
    history: fallback.history ?? [],
    isDeleted: data.deleted ?? data.isDeleted ?? false,
    deletedDate: formatDisplayDate(data.deletedAt ?? data.deletedDate) || null,
  };
}

const IncomeDetailPage1 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initial = location.state?.incomeData;

  const [incomeData, setIncomeData] = useState(
    initial || {
      id: null,
      title: "동아리 지원금",
      registrationDate: "2026.02.05",
      amount: "+100,000원",
      date: "2026.02.03",
      event: "-",
      memo: "-",
      receipt: null,
      history: [],
      isDeleted: false,
      deletedDate: null,
    },
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const transactionId = initial?.id ?? incomeData.id;
    if (!transactionId) return;

    let ignore = false;

    async function loadDetail() {
      setIsLoading(true);
      setError("");
      try {
        const [detail, histories, receipt] = await Promise.all([
          getTransaction(transactionId),
          getTransactionHistories(transactionId),
          getReceipt(transactionId).catch(() => null),
        ]);

        if (ignore) return;

        setIncomeData(
          mapTransactionToView(detail, {
            ...initial,
            id: transactionId,
            history: histories,
            receipt: receipt?.fileName ?? receipt?.url ?? initial?.receipt ?? null,
          }),
        );
      } catch (err) {
        if (!ignore) {
          setError(err.message ?? "상세 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDetail();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  const handleDeleteConfirm = async () => {
    const transactionId = incomeData.id;
    if (!transactionId) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      await deleteTransaction(transactionId);
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
          <button
            className="btn-action btn-edit"
            onClick={() =>
              navigate("/income-edit", { state: { incomeData } })
            }
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
              등록 {incomeData.registrationDate}
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
            <span className="value">
              {String(incomeData.amount).replace("-", "").replace("+", "")}
            </span>
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
        <h3 className="section-heading">영수증</h3>
        <div className="section-box">
          {incomeData.receipt ? (
            <span>{incomeData.receipt}</span>
          ) : (
            "첨부된 영수증이 없습니다"
          )}
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
              <button className="btn-modal-confirm" onClick={handleDeleteConfirm}>
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeDetailPage1;
