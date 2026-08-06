import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  deleteReceipt,
  deleteTransaction,
  getReceipt,
  getTransaction,
} from "../../../api";
import backArrowIcon from "../../../assets/화살표.svg";
import useGroup from "../../../hooks/useGroup";

function formatDisplayDate(dateString) {
  if (!dateString) return "-";

  return String(dateString).slice(0, 10).replaceAll("-", ".");
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ??
    error?.message ??
    fallback
  );
}

export default function TransactionDetail({
  transactionType,
  editPath,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTermId, isGroupLoading } = useGroup();
  const transactionId = searchParams.get("transactionId");

  const [transaction, setTransaction] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    if (
      isGroupLoading ||
      currentTermId == null ||
      !transactionId
    ) {
      return undefined;
    }

    async function loadTransaction() {
      setIsLoading(true);
      setError("");

      try {
        const [transactionData, receiptData] = await Promise.all([
          getTransaction(currentTermId, transactionId),
          getReceipt(transactionId).catch((requestError) => {
            if (requestError?.response?.status === 404) return null;
            throw requestError;
          }),
        ]);

        if (ignore) return;

        setTransaction(transactionData);
        setReceipt(receiptData);
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(
              requestError,
              "거래 상세 정보를 불러오지 못했습니다.",
            ),
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadTransaction();

    return () => {
      ignore = true;
    };
  }, [currentTermId, isGroupLoading, transactionId]);

  async function handleDeleteTransaction() {
    try {
      setIsDeleting(true);
      setError("");
      await deleteTransaction(currentTermId, transactionId);
      navigate("/ledger");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "거래 삭제에 실패했습니다."),
      );
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleDeleteReceipt() {
    try {
      setError("");
      await deleteReceipt(transactionId);
      setReceipt(null);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "영수증 삭제에 실패했습니다."),
      );
    }
  }

  if (isGroupLoading || isLoading) {
    return <div className="detail-container">불러오는 중...</div>;
  }

  if (currentTermId == null) {
    return (
      <div className="detail-container">
        조회할 기수를 선택해주세요.
      </div>
    );
  }

  if (!transactionId) {
    return (
      <div className="detail-container">
        조회할 거래 ID가 없습니다.
      </div>
    );
  }

  if (error && !transaction) {
    return <div className="detail-container">{error}</div>;
  }

  if (!transaction) return null;

  const amountSign = transactionType === "EXPENSE" ? "-" : "+";
  const formattedAmount = `${Math.abs(
    Number(transaction.amount) || 0,
  ).toLocaleString()}원`;

  return (
    <div className="detail-container">
      <div className="detail-top-nav">
        <button className="btn-back" onClick={() => navigate("/ledger")}>
          <img src={backArrowIcon} alt="" className="back-arrow-svg" />
          가계부 목록으로
        </button>

        <div className="action-buttons">
          <button
            className="btn-action btn-edit"
            onClick={() =>
              navigate(`${editPath}?transactionId=${transactionId}`)
            }
          >
            수정
          </button>
          <button
            className="btn-action btn-delete"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            삭제
          </button>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="detail-header-section">
        <div
          className="title-area"
          style={{ display: "flex", flexDirection: "column" }}
        >
          <h1 className="detail-main-title">{transaction.title}</h1>
          <p className="detail-reg-date" style={{ margin: 0 }}>
            등록 {formatDisplayDate(transaction.createdAt)}
          </p>
        </div>
        <div className="detail-amount">
          {amountSign}
          {formattedAmount}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">내용</span>
            <span className="value">{transaction.title}</span>
          </div>
          <div className="detail-item">
            <span className="label">금액</span>
            <span className="value">{formattedAmount}</span>
          </div>
          <div className="detail-item">
            <span className="label">날짜</span>
            <span className="value">
              {formatDisplayDate(transaction.transactionDate)}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">행사</span>
            <span className="value">
              {transaction.fundingName ?? "-"}
            </span>
          </div>
          <div className="detail-item full-width">
            <span className="label">메모</span>
            <span className="value">{transaction.memo || "-"}</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3 className="section-heading">영수증</h3>
        <div className="section-box">
          {receipt ? (
            <>
              <a
                href={receipt.presignedUrl}
                target="_blank"
                rel="noreferrer"
              >
                {receipt.originalFilename}
              </a>{" "}
              <button type="button" onClick={handleDeleteReceipt}>
                삭제
              </button>
            </>
          ) : (
            "첨부된 영수증이 없습니다"
          )}
        </div>
      </div>

      <div className="detail-section">
        <h3 className="section-heading">수정 이력</h3>
        <div className="section-box">수정 이력이 없습니다</div>
      </div>

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>거래 삭제</h3>
            <p>{transaction.title} 내역을 삭제합니다</p>
            <p className="modal-sub-text">
              거래를 삭제해도 삭제 이력까지 계속 보관돼요
            </p>
            <div className="modal-buttons">
              <button
                className="btn-modal-cancel"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                className="btn-modal-confirm"
                onClick={handleDeleteTransaction}
                disabled={isDeleting}
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
