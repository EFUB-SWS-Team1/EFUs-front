import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LedgerCreatePage.css";

import logoIcon from "../../assets/efub로고1.svg";
import calendarIcon from "../../assets/Calendar.svg";
import checkIcon from "../../assets/checkbox.svg";
import { getLedgerEntries } from "../../api/ledger";

// TODO: 나중에 useGroup의 실제 숫자 termId로 교체
const TERM_ID = 1;

export default function LedgerCreatePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("expense");
  const [isFeeCollect, setIsFeeCollect] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadLedger() {
      setIsLoading(true);
      setError(null);
      try {
        const typeMap = {
          all: "ALL",
          income: "INCOME",
          expense: "EXPENSE",
        };
        const data = await getLedgerEntries(TERM_ID, {
          type: typeMap[filter] ?? "ALL",
        });
        if (!ignore) setGroups(data);
      } catch (err) {
        if (!ignore) {
          setError(err);
          setGroups([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadLedger();
    return () => {
      ignore = true;
    };
  }, [filter]);

  const handleNextClick = () => {
    if (selectedType === "income") {
      if (isFeeCollect) {
        navigate("/income2");
      } else {
        navigate("/income");
      }
    } else {
      navigate("/expense");
    }
  };

  return (
    <div className="account-container">
      <header className="account-header">
        <div className="header-title">
          <div className="logo-box">
            <img src={logoIcon} alt="로고" className="logo-icon" />
          </div>
          <h1>가계부</h1>
        </div>

        <button className="add-btn" onClick={() => setIsModalOpen(true)}>
          + 내역 추가
        </button>
      </header>

      <section className="filter-section">
        <div className="filter-period">
          <label className="filter-label">기간</label>
          <div className="select-box">
            <img src={calendarIcon} alt="달력" className="calendar-icon" />
            <span>전체</span>
          </div>
        </div>

        <div className="tab-group">
          <button
            className={`tab-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            전체
          </button>
          <button
            className={`tab-btn ${filter === "income" ? "active" : ""}`}
            onClick={() => setFilter("income")}
          >
            수입
          </button>
          <button
            className={`tab-btn ${filter === "expense" ? "active" : ""}`}
            onClick={() => setFilter("expense")}
          >
            지출
          </button>
        </div>
      </section>

      <main className="transaction-list">
        {isLoading && <p>불러오는 중...</p>}

        {!isLoading && error && (
          <p>가계부 내역을 불러오지 못했습니다.</p>
        )}

        {!isLoading && !error && groups.length === 0 && (
          <p>등록된 내역이 없습니다.</p>
        )}

        {!isLoading &&
          !error &&
          groups.map((group) => (
            <section key={group.date} className="date-group">
              <h2 className="date-title">{group.date}</h2>
              <div className="table-card">
                <div className="table-header">
                  <span className="col-event">행사</span>
                  <span className="col-desc">내용</span>
                  <span className="col-amount">금액</span>
                </div>
                {group.items.map((item) => (
                  <div key={`${item.entryType}-${item.id}`} className="table-row">
                    <span className="col-event">{item.event}</span>
                    <span className="col-desc">{item.desc}</span>
                    <span className={`col-amount ${item.type}`}>
                      {item.amount > 0
                        ? `+${item.amount.toLocaleString()}`
                        : item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">내역 추가</h3>

            <div className="modal-options">
              <label
                className={`type-option ${selectedType === "income" ? "selected" : ""}`}
                onClick={() => setSelectedType("income")}
              >
                <input
                  type="radio"
                  name="transactionType"
                  checked={selectedType === "income"}
                  onChange={() => setSelectedType("income")}
                />
                <span className="custom-radio"></span>
                <span className="option-label">수입 (+)</span>
              </label>

              {selectedType === "income" && (
                <label className="fee-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isFeeCollect}
                    onChange={(e) => setIsFeeCollect(e.target.checked)}
                  />
                  <span className="custom-checkbox">
                    {isFeeCollect && (
                      <img src={checkIcon} alt="check" className="check-icon" />
                    )}
                  </span>
                  <span>회비로 걷기</span>
                </label>
              )}

              <label
                className={`type-option ${selectedType === "expense" ? "selected" : ""}`}
                onClick={() => setSelectedType("expense")}
              >
                <input
                  type="radio"
                  name="transactionType"
                  checked={selectedType === "expense"}
                  onChange={() => setSelectedType("expense")}
                />
                <span className="custom-radio"></span>
                <span className="option-label">지출 (-)</span>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn-next" onClick={handleNextClick}>
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}