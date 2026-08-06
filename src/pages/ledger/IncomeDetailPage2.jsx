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
  getChargePaymentMembersPage,
  payChargeMember,
} from "../../api";
import useGroup from "../../hooks/useGroup";

const HISTORY_PAGE_SIZE = 20;

function formatDisplayDate(dateStr) {
  if (!dateStr) return "-";

  return String(dateStr)
    .slice(0, 10)
    .replaceAll("-", ".");
}

function formatWon(amount) {
  const num = Math.abs(Number(amount) || 0);

  return `${num.toLocaleString()}원`;
}

function formatHistoryDate(date) {
  return date
    ? String(date).slice(0, 10)
    : "-";
}

function formatHistoryContent(content) {
  const text = String(content ?? "-").trim();

  return text
    .replace(
      /(을|를)\s+(추가|변경|수정|삭제)(?:했습니다|하였습니다|함)?\.?$/,
      " $2",
    )
    .replace(
      /(추가|변경|수정|삭제)(?:했습니다|하였습니다|되었습니다|함|됨)\.?$/,
      "$1",
    )
    .replace(
      /(?:했습니다|하였습니다)\.?$/,
      "",
    )
    .trim();
}

function mapChargeToView(data, fallback = {}) {
  return {
    id:
      data.id ??
      data.chargeId ??
      fallback.id,

    title:
      data.title ??
      fallback.title ??
      "",

    registrationDate:
      formatDisplayDate(
        data.createdAt ??
          data.registrationDate,
      ) ||
      fallback.registrationDate ||
      "-",

    amount: formatWon(
      data.requestedAmount ??
        data.totalAmount ??
        fallback.rawAmount ??
        0,
    ),

    date:
      formatDisplayDate(
        data.dueDate ?? data.date,
      ) ||
      fallback.date ||
      "-",

    event:
      data.fundingName ??
      data.event ??
      fallback.event ??
      "-",

    memo:
      data.memo ||
      fallback.memo ||
      "-",

    history:
      fallback.history ?? [],

    isDeleted:
      data.deleted ??
      data.isDeleted ??
      false,

    deletedDate:
      formatDisplayDate(
        data.deletedAt ??
          data.deletedDate,
      ) || null,

    paidAmount:
      data.paidAmount ?? 0,

    unpaidAmount:
      data.unpaidAmount ?? 0,

    paidCount:
      data.paidCount ?? null,

    unpaidCount:
      data.unpaidCount ?? null,

    paymentStatus:
      data.paymentStatus ??
      fallback.paymentStatus ??
      "UNPAID",

    chargeMethod:
      data.chargeMethod ??
      fallback.chargeMethod,

    fundingId:
      data.fundingId ??
      fallback.fundingId ??
      null,

    deletedAt:
      data.deletedAt ?? null,
  };
}

const IncomeDetailPage2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, termStatus } = useGroup();

  const initial = location.state?.incomeData;

  const [incomeData, setIncomeData] = useState(
    initial || {
      id: null,
      title: "",
      registrationDate: "-",
      amount: "0원",
      date: "-",
      event: "-",
      memo: "-",
      history: [],
      isDeleted: false,
      deletedDate: null,
      paidAmount: 0,
    },
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [keyword, setKeyword] =
    useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [memberList, setMemberList] =
    useState([]);

  const [historyPage, setHistoryPage] =
    useState(0);

  const [historyPageInfo, setHistoryPageInfo] =
    useState({
      page: 0,
      size: HISTORY_PAGE_SIZE,
      totalElements: 0,
      totalPages: 0,
      hasNext: false,
    });

  const [isLoading, setIsLoading] =
    useState(false);

  const [payingMemberId, setPayingMemberId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [historyError, setHistoryError] =
    useState("");

  const chargeId =
    initial?.id ??
    incomeData.id;

  const isStaff =
    String(role ?? "").toUpperCase() === "STAFF";

  const isActiveTerm =
    String(termStatus ?? "").toUpperCase() === "ACTIVE";

  const canManagePayments =
    isStaff &&
    isActiveTerm &&
    !incomeData.isDeleted;

  const canManageCharge =
    isStaff &&
    isActiveTerm &&
    !incomeData.isDeleted;

  async function reloadMembers(id) {
    const result =
      await getChargePaymentMembersPage(
        id,
        {
          keyword,
          paymentStatus,
          page,
          size: 8,
        },
      );

    setMemberList(result.members);
    setTotalPages(result.totalPages);
  }

  async function reloadHistories(id) {
    try {
      setHistoryError("");

      const historyData = await getChargeHistories(
        id,
        {
          page: historyPage,
          size: HISTORY_PAGE_SIZE,
        },
      );

      setIncomeData((previous) => ({
        ...previous,
        history: historyData.histories,
      }));

      setHistoryPageInfo(historyData.pageInfo);
    } catch (requestError) {
      setHistoryError(
        requestError.response?.data?.message ??
          requestError.message ??
          "수정 이력을 불러오지 못했습니다.",
      );

      setIncomeData((previous) => ({
        ...previous,
        history: [],
      }));
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setKeyword(searchTerm);
    }, 300);

    return () =>
      clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!chargeId) return;

    let ignore = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const detail = await getCharge(chargeId);

        if (ignore) return;

        setIncomeData((previous) =>
          mapChargeToView(
            detail,
            {
              ...previous,
              ...initial,
              id: chargeId,
              history: previous.history,
            },
          ),
        );
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.message ??
              err.message ??
              "회비 상세를 불러오지 못했습니다.",
          );

          // 등록 직후 state만 있어도
          // 화면은 표시할 수 있도록 유지
          if (initial) {
            setIncomeData((prev) => ({
              ...prev,
              id: chargeId,
            }));
          }
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chargeId]);

  useEffect(() => {
    if (!chargeId) return;

    let ignore = false;

    async function loadHistories() {
      setHistoryError("");

      try {
        const historyData = await getChargeHistories(
          chargeId,
          {
            page: historyPage,
            size: HISTORY_PAGE_SIZE,
          },
        );

        if (ignore) return;

        setIncomeData((previous) => ({
          ...previous,
          history: historyData.histories,
        }));
        setHistoryPageInfo(historyData.pageInfo);
      } catch (requestError) {
        if (ignore) return;

        setHistoryError(
          requestError.response?.data?.message ??
            requestError.message ??
            "수정 이력을 불러오지 못했습니다.",
        );
        setIncomeData((previous) => ({
          ...previous,
          history: [],
        }));
      }
    }

    loadHistories();

    return () => {
      ignore = true;
    };
  }, [chargeId, historyPage]);

  useEffect(() => {
    if (!chargeId) return;

    let ignore = false;

    getChargePaymentMembersPage(
      chargeId,
      {
        keyword,
        paymentStatus,
        page,
        size: 8,
      },
    )
      .then((result) => {
        if (ignore) return;

        setMemberList(
          result.members,
        );

        setTotalPages(
          result.totalPages,
        );
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err.response?.data?.message ??
              err.message ??
              "납부 현황을 불러오지 못했습니다.",
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [
    chargeId,
    keyword,
    paymentStatus,
    page,
  ]);

  const handleAllComplete = async () => {
    if (
      !chargeId ||
      !canManagePayments
    ) {
      return;
    }

    try {
      setError("");

      await bulkPayCharge(
        chargeId,
        {
          targetMode: "ALL_UNPAID",
        },
      );

      await reloadMembers(
        chargeId,
      );

      await reloadHistories(
        chargeId,
      );

      const detail =
        await getCharge(
          chargeId,
        );

      setIncomeData((prev) =>
        mapChargeToView(
          detail,
          {
            ...prev,
            history:
              prev.history,
          },
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ??
          err.message ??
          "전체 납부 처리에 실패했습니다.",
      );
    }
  };

  const handleMemberPayment = async (
    member,
  ) => {
    if (
      !chargeId ||
      !canManagePayments ||
      member.status !== "pending" ||
      payingMemberId !== null
    ) {
      return;
    }

    try {
      setError("");

      setPayingMemberId(
        member.chargeMemberId,
      );

      await payChargeMember(
        chargeId,
        member.chargeMemberId,
      );

      await reloadMembers(
        chargeId,
      );

      const detail =
        await getCharge(
          chargeId,
        );

      setIncomeData((prev) =>
        mapChargeToView(
          detail,
          {
            ...prev,
            history:
              prev.history,
          },
        ),
      );
    } catch (err) {
      setError(
        err.response?.data?.message ??
          err.message ??
          "납부 처리에 실패했습니다.",
      );
    } finally {
      setPayingMemberId(null);
    }
  };

  const completedCount =
    incomeData.paidCount ??
    memberList.filter(
      (member) =>
        member.status === "completed",
    ).length;

  const pendingCount =
    incomeData.unpaidCount ??
    memberList.filter(
      (member) =>
        member.status === "pending",
    ).length;

  const paidAmountSum = useMemo(() => {
    if (
      incomeData.paidAmount != null &&
      incomeData.paidAmount !== 0
    ) {
      return formatWon(
        incomeData.paidAmount,
      );
    }

    const sum = memberList
      .filter(
        (member) =>
          member.status === "completed",
      )
      .reduce(
        (acc, member) =>
          acc +
          (Number(member.amount) || 0),
        0,
      );

    return formatWon(sum);
  }, [
    incomeData.paidAmount,
    memberList,
  ]);

  const handleDeleteConfirm = async () => {
    if (!chargeId || !canManageCharge) {
      setIsDeleteModalOpen(false);
      return;
    }

    try {
      setError("");

      // 삭제 API는 한 번만 호출
      await deleteCharge(
        chargeId,
      );

      const today =
        formatDisplayDate(
          new Date().toISOString(),
        );

      let refreshed = {};
      let historyData = null;

      // 삭제된 회비도 상세 조회가 가능하므로
      // 최신 deleted/deletedAt 정보 재조회
      try {
        refreshed =
          await getCharge(
            chargeId,
          );
      } catch {
        // 삭제 API가 성공했다면
        // 후속 상세 조회 실패 때문에
        // 삭제 자체를 실패 처리하지 않는다.
      }

      // 최신 수정 이력 재조회
      try {
        historyData =
          await getChargeHistories(
            chargeId,
            {
              page: 0,
              size: HISTORY_PAGE_SIZE,
            },
          );
      } catch {
        // 이력 조회 실패로
        // 성공한 삭제를 실패 처리하지 않는다.
      }

      setIncomeData(
        (previous) => ({
          ...mapChargeToView(
            refreshed,
            previous,
          ),

          isDeleted:
            refreshed.deleted ??
            true,

          deletedDate:
            refreshed.deletedAt
              ? formatDisplayDate(
                  refreshed.deletedAt,
                )
              : today,

          history:
            historyData?.histories ??
            previous.history ??
            [],
        }),
      );

      setHistoryPage(0);

      if (historyData) {
        setHistoryPageInfo(
          historyData.pageInfo,
        );
      }

      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message ??
          err.message ??
          "삭제에 실패했습니다.",
      );

      setIsDeleteModalOpen(false);
    }
  };

  if (!chargeId) {
    return (
      <div className="detail-container">
        <button
          className="btn-back"
          onClick={() => navigate("/ledger")}
        >
          <img
            src={backArrowIcon}
            alt="뒤로가기"
            className="back-arrow-svg"
          />{" "}
          가계부 목록으로
        </button>
        <p>조회할 회비 정보가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-top-nav">
        <button
          className="btn-back"
          onClick={() =>
            navigate("/ledger")
          }
        >
          <img
            src={backArrowIcon}
            alt="뒤로가기"
            className="back-arrow-svg"
          />{" "}
          가계부 목록으로
        </button>

        <div className="action-buttons">
          <button
            className="btn-action btn-edit"
            onClick={() =>
              navigate(
                "/income2",
                {
                  state: {
                    chargeId,
                  },
                },
              )
            }
            disabled={
              !canManageCharge
            }
          >
            수정
          </button>

          <button
            className="btn-action btn-delete"
            onClick={() =>
              setIsDeleteModalOpen(
                true,
              )
            }
            disabled={
              !canManageCharge
            }
          >
            삭제
          </button>
        </div>
      </div>

      {isLoading && (
        <p>불러오는 중...</p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <div className="detail-header-section">
        <div
          className="title-area"
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1
            className={`detail-main-title ${
              incomeData.isDeleted
                ? "deleted-text"
                : ""
            }`}
          >
            {incomeData.title}
          </h1>

          {incomeData.isDeleted ? (
            <p
              className="deleted-date-text"
              style={{ margin: 0 }}
            >
              삭제된 날짜{" "}
              {incomeData.deletedDate}
            </p>
          ) : (
            <p
              className="detail-reg-date"
              style={{ margin: 0 }}
            >
              등록된 날짜{" "}
              {incomeData.registrationDate}
            </p>
          )}
        </div>

        <div
          className={`detail-amount ${
            incomeData.isDeleted
              ? "deleted-text"
              : ""
          }`}
        >
          {incomeData.amount}
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">
              내용
            </span>

            <span className="value">
              {incomeData.title}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">
              금액
            </span>

            <span className="value">
              {incomeData.amount}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">
              날짜
            </span>

            <span className="value">
              {incomeData.date}
            </span>
          </div>

          <div className="detail-item">
            <span className="label">
              행사
            </span>

            <span className="value">
              {incomeData.event}
            </span>
          </div>

          <div className="detail-item full-width">
            <span className="label">
              메모
            </span>

            <span className="value">
              {incomeData.memo}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-section charge-history-section">
        <h3 className="section-heading charge-history-title">
          수정 이력
        </h3>

        <div
          className={`section-box charge-history-card ${
            incomeData.history?.length
              ? ""
              : "is-empty"
          }`}
        >
          {historyError ? (
            <p>{historyError}</p>
          ) : incomeData.history &&
          incomeData.history.length >
            0 ? (
            <table className="history-table charge-history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>이름</th>
                  <th>수정 내용</th>
                </tr>
              </thead>

              <tbody>
                {incomeData.history.map(
                  (item, index) => (
                    <tr
                      key={`${item.date}-${item.author}-${index}`}
                    >
                      <td>
                        {formatHistoryDate(
                          item.date,
                        )}
                      </td>

                      <td>
                        {item.author}
                      </td>

                      <td>
                        {formatHistoryContent(
                          item.content,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          ) : (
            "수정 이력이 없습니다"
          )}
        </div>

        {historyPageInfo.totalPages >
          1 && (
          <div className="history-pagination">
            <button
              type="button"
              disabled={
                historyPageInfo.page <=
                0
              }
              onClick={() =>
                setHistoryPage(
                  (
                    currentPage,
                  ) =>
                    currentPage -
                    1,
                )
              }
            >
              이전
            </button>

            <span>
              {historyPageInfo.page +
                1}{" "}
              /{" "}
              {
                historyPageInfo.totalPages
              }
            </span>

            <button
              type="button"
              disabled={
                !historyPageInfo.hasNext
              }
              onClick={() =>
                setHistoryPage(
                  (
                    currentPage,
                  ) =>
                    currentPage +
                    1,
                )
              }
            >
              다음
            </button>
          </div>
        )}
      </div>

      <div className="summary-cards-row">
        <div className="summary-card">
          <span className="summary-card-label">
            납부된 금액
          </span>

          <span className="summary-card-value">
            {paidAmountSum}
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-card-label">
            납부 완료
          </span>

          <span className="summary-card-value">
            {completedCount}명
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-card-label">
            미납
          </span>

          <span className="summary-card-value">
            {pendingCount}명
          </span>
        </div>

        <div className="summary-card">
          <span className="summary-card-label">
            전체 납부 상태
          </span>

          <span className="summary-card-value">
            {incomeData.paymentStatus}
          </span>
        </div>
      </div>

      <div className="detail-section">
        <h3
          className="payment-section-title"
          style={{
            marginBottom: "16px",
          }}
        >
          납부 현황
        </h3>

        <div className="target-search-row">
          <div className="target-search-input-wrap">
            <Search
              size={16}
              className="search-icon"
            />

            <input
              type="text"
              placeholder="     이름으로 검색"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value,
                )
              }
              className="target-search-input"
            />
          </div>

          <select
            className="payment-status-filter"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(
                e.target.value,
              );
              setPage(0);
            }}
            aria-label="납부 상태 필터"
          >
            <option value="">
              전체
            </option>

            <option value="UNPAID">
              미납
            </option>

            <option value="PAID">
              완료
            </option>
          </select>

          <button
            type="button"
            className="btn-bulk-select"
            onClick={
              handleAllComplete
            }
            disabled={
              !canManagePayments
            }
          >
            전체 납부 처리
          </button>
        </div>

        <div className="target-select-box">
          <div className="target-list-grid">
            {memberList.map(
              (member) => {
                const isCompleted =
                  member.status ===
                  "completed";

                return (
                  <div
                    key={
                      member.chargeMemberId
                    }
                    className={`target-item ${
                      isCompleted
                        ? "checked"
                        : ""
                    }`}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        className={`badge ${
                          member.role ===
                          "운영진"
                            ? "admin"
                            : "general"
                        }`}
                      >
                        {
                          member.role
                        }
                      </span>

                      <span className="target-name">
                        {
                          member.name
                        }
                      </span>

                      <span className="target-amount">
                        {formatWon(
                          member.assignedAmount,
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`status-badge-btn ${
                        isCompleted
                          ? "completed"
                          : "pending"
                      }`}
                      onClick={() =>
                        handleMemberPayment(
                          member,
                        )
                      }
                      disabled={
                        isCompleted ||
                        !canManagePayments ||
                        payingMemberId !==
                          null
                      }
                    >
                      {isCompleted
                        ? "완료"
                        : "미납"}
                    </button>
                  </div>
                );
              },
            )}
          </div>

          <div className="pagination-mock">
            <button
              type="button"
              onClick={() =>
                setPage(
                  (value) =>
                    value - 1,
                )
              }
              disabled={
                page === 0
              }
            >
              &lt;
            </button>

            <span>
              {totalPages === 0
                ? 0
                : page + 1}{" "}
              / {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage(
                  (value) =>
                    value + 1,
                )
              }
              disabled={
                page + 1 >=
                totalPages
              }
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>
              거래 삭제
            </h3>

            <p>
              {incomeData.title}{" "}
              내역을 삭제합니다
            </p>

            <p className="modal-sub-text">
              거래를 삭제해도 삭제
              이력까지 계속 보관돼요
            </p>

            <div className="modal-buttons">
              <button
                className="btn-modal-cancel"
                onClick={() =>
                  setIsDeleteModalOpen(
                    false,
                  )
                }
              >
                취소
              </button>

              <button
                className="btn-modal-confirm"
                onClick={
                  handleDeleteConfirm
                }
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
