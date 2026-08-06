import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LedgerCreatePage.css";

import logoIcon from "../../assets/efub로고1.svg";
import calendarIcon from "../../assets/Calendar.svg";
import checkIcon from "../../assets/checkbox.svg";
import { getLedgerEntries } from "../../api";
import useGroup from "../../hooks/useGroup";

const PAGE_SIZE = 20;

const EMPTY_PAGE_INFO = {
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
};

export default function LedgerCreatePage() {
  const navigate = useNavigate();
  const { currentTermId, isGroupLoading } = useGroup();

  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);

  const [groups, setGroups] = useState([]);
  const [paginationState, setPaginationState] =
    useState({
      termId: null,
      page: 0,
    });

  const page =
    String(paginationState.termId) ===
    String(currentTermId)
      ? paginationState.page
      : 0;
  const [pageInfo, setPageInfo] = useState(
    EMPTY_PAGE_INFO,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [selectedType, setSelectedType] =
    useState("expense");
  const [isFeeCollect, setIsFeeCollect] =
    useState(false);

  useEffect(() => {
    let ignore = false;

    if (isGroupLoading) {
      return undefined;
    }

    if (
      isGroupLoading ||
      currentTermId == null
    ) {
      return undefined;
    }

    async function loadLedger() {
      setIsLoading(true);
      setError(null);

      if (
        fromDate &&
        toDate &&
        fromDate > toDate
      ) {
        setError(
          new Error(
            "시작 날짜는 종료 날짜보다 늦을 수 없습니다.",
          ),
        );
        setGroups([]);
        setPageInfo(EMPTY_PAGE_INFO);
        setIsLoading(false);
        return;
      }

      try {
        const typeMap = {
          all: "ALL",
          income: "INCOME",
          expense: "EXPENSE",
        };

        const data = await getLedgerEntries(
          currentTermId,
          {
            type: typeMap[filter] ?? "ALL",
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            includeDeleted: false,
            page,
            size: PAGE_SIZE,
          },
        );

        if (ignore) return;

        setGroups(data.groups);

        setPageInfo(data.pageInfo);
      } catch (requestError) {
        if (ignore) return;

        setError(requestError);
        setGroups([]);
        setPageInfo(EMPTY_PAGE_INFO);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadLedger();

    return () => {
      ignore = true;
    };
  }, [
    currentTermId,
    isGroupLoading,
    filter,
    fromDate,
    toDate,
    page,
  ]);

  function resetPage() {
    setPaginationState({
      termId: currentTermId,
      page: 0,
    });
  }

  function updatePage(nextPageOrUpdater) {
    setPaginationState((previousState) => {
      const currentPage =
        String(previousState.termId) ===
        String(currentTermId)
          ? previousState.page
          : 0;

      const nextPage =
        typeof nextPageOrUpdater === "function"
          ? nextPageOrUpdater(currentPage)
          : nextPageOrUpdater;

      return {
        termId: currentTermId,
        page: Math.max(nextPage, 0),
      };
    });
  }

  function handleFilterChange(nextFilter) {
    setFilter(nextFilter);
    resetPage();
  }

  function handleFromDateChange(event) {
    setFromDate(event.target.value);
    resetPage();
  }

  function handleToDateChange(event) {
    setToDate(event.target.value);
    resetPage();
  }

  function handleResetDates() {
    setFromDate("");
    setToDate("");
    resetPage();
  }

  function handlePreviousPage() {
    updatePage((currentPage) => currentPage - 1);
  }

  function handleNextPage() {
    if (!pageInfo.hasNext) return;

    updatePage((currentPage) => currentPage + 1);
  }

  function handleNextClick() {
    setIsModalOpen(false);

    if (selectedType === "income") {
      if (isFeeCollect) {
        navigate("/income2");
      } else {
        navigate("/income");
      }

      return;
    }

    navigate("/expense");
  }

  const errorMessage =
    error?.response?.data?.message ??
    error?.message ??
    "가계부 내역을 불러오지 못했습니다.";

  const hasSelectedTerm = currentTermId != null;

  const visibleGroups = hasSelectedTerm
    ? groups
    : [];

  const hasEntries = visibleGroups.length > 0;
  const periodLabel = fromDate || toDate
    ? `${fromDate ? fromDate.replaceAll("-", ".") : "시작일"} – ${toDate ? toDate.replaceAll("-", ".") : "종료일"}`
    : "전체";


  return (
    <div className="account-container">
      <header className="account-header">
        <div className="header-title">
          <div className="logo-box">
            <img
              src={logoIcon}
              alt="EFUs"
              className="logo-icon"
            />
          </div>

          <h1>가계부</h1>
        </div>

        <button
          type="button"
          className="add-btn"
          disabled={currentTermId == null}
          onClick={() => setIsModalOpen(true)}
        >
          + 내역 추가
        </button>
      </header>

      <section className="filter-section">
        <div className="filter-period">
          <label className="filter-label">
            기간
          </label>

          <button
            type="button"
            className="period-select-trigger"
            onClick={() => setIsPeriodOpen((value) => !value)}
            aria-expanded={isPeriodOpen}
            aria-controls="period-picker"
          >
            <img src={calendarIcon} alt="" aria-hidden="true" className="calendar-icon" />
            <span>{periodLabel}</span>
          </button>

          {isPeriodOpen && (
            <div className="period-picker" id="period-picker">
              <div className="period-picker-dates">
                <label>
                  <span>시작일</span>
                  <input type="date" value={fromDate} onChange={handleFromDateChange} />
                </label>
                <span className="period-divider" aria-hidden="true">–</span>
                <label>
                  <span>종료일</span>
                  <input type="date" value={toDate} onChange={handleToDateChange} />
                </label>
              </div>
              <div className="period-picker-actions">
                {(fromDate || toDate) && (
                  <button type="button" className="period-reset-btn" onClick={handleResetDates}>
                    초기화
                  </button>
                )}
              <button
                type="button"
                  className="period-apply-btn"
                  onClick={() => setIsPeriodOpen(false)}
              >
                  확인
              </button>
              </div>
            </div>
          )}
        </div>

        <div className="tab-group">
          <button
            type="button"
            className={`tab-btn ${
              filter === "all" ? "active" : ""
            }`}
            onClick={() =>
              handleFilterChange("all")
            }
          >
            전체
          </button>

          <button
            type="button"
            className={`tab-btn ${
              filter === "income"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleFilterChange("income")
            }
          >
            수입
          </button>

          <button
            type="button"
            className={`tab-btn ${
              filter === "expense"
                ? "active"
                : ""
            }`}
            onClick={() =>
              handleFilterChange("expense")
            }
          >
            지출
          </button>
        </div>
      </section>

      <main className="transaction-list">
        {(isGroupLoading || isLoading) && (
          <p>불러오는 중...</p>
        )}

        {!isGroupLoading &&
          currentTermId == null && (
            <p>조회할 기수를 선택해 주세요.</p>
          )}

        {hasSelectedTerm &&
          !isLoading &&
          error && <p>{errorMessage}</p>}

        {!isLoading &&
          !error &&
          currentTermId != null &&
          !hasEntries && (
            <p>등록된 내역이 없습니다.</p>
          )}

        {!isLoading &&
          !error &&
          visibleGroups.map((group) => (
            <section
              key={group.date}
              className="date-group"
            >
              <h2 className="date-title">
                {group.date}
              </h2>

              <div className="table-card">
                <div className="table-header">
                  <span className="col-event">
                    행사
                  </span>
                  <span className="col-desc">
                    내용
                  </span>
                  <span className="col-amount">
                    금액
                  </span>
                </div>

                {group.items.map((item) => (
                  <div
                    key={`${item.entryType}-${item.id}`}
                    className="table-row"
                  >
                    <span className="col-event">
                      {item.event}
                    </span>

                    <span className="col-desc">
                      {item.deleted
                        ? `${item.desc} (삭제됨)`
                        : item.desc}
                    </span>

                    <span
                      className={`col-amount ${item.type}`}
                    >
                      {item.amount > 0
                        ? `+${item.amount.toLocaleString()}원`
                        : `${item.amount.toLocaleString()}원`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </main>

      {hasSelectedTerm &&
        !isLoading &&
        !error &&
        pageInfo.totalPages > 0 && (
          <div className="ledger-pagination" aria-label="가계부 목록 페이지 이동">
            <button
              type="button"
              className="ledger-page-btn"
              disabled={pageInfo.page <= 0}
              onClick={handlePreviousPage}
              aria-label="이전 페이지"
            >
              ‹
            </button>

            <span className="ledger-page-info">
              {pageInfo.page + 1} /{" "}
              {pageInfo.totalPages}
            </span>

            <button
              type="button"
              className="ledger-page-btn"
              disabled={!pageInfo.hasNext}
              onClick={handleNextPage}
              aria-label="다음 페이지"
            >
              ›
            </button>
          </div>
        )}

      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h3 className="modal-title">
              내역 추가
            </h3>

            <div className="modal-options">
              <label
                className={`type-option ${
                  selectedType === "income"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="transactionType"
                  checked={
                    selectedType === "income"
                  }
                  onChange={() =>
                    setSelectedType("income")
                  }
                />

                <span className="custom-radio" />

                <span className="option-label">
                  수입 (+)
                </span>
              </label>

              {selectedType === "income" && (
                <label className="fee-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isFeeCollect}
                    onChange={(event) =>
                      setIsFeeCollect(
                        event.target.checked,
                      )
                    }
                  />

                  <span className="custom-checkbox">
                    {isFeeCollect && (
                      <img
                        src={checkIcon}
                        alt=""
                        aria-hidden="true"
                        className="check-icon"
                      />
                    )}
                  </span>

                  <span>회비로 걷기</span>
                </label>
              )}

              <label
                className={`type-option ${
                  selectedType === "expense"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="transactionType"
                  checked={
                    selectedType === "expense"
                  }
                  onChange={() =>
                    setSelectedType("expense")
                  }
                />

                <span className="custom-radio" />

                <span className="option-label">
                  지출 (-)
                </span>
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() =>
                  setIsModalOpen(false)
                }
              >
                취소
              </button>

              <button
                type="button"
                className="btn-next"
                onClick={handleNextClick}
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
