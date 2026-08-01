import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 추가!
import './LedgerCreatePage.css';

import logoIcon from '../../assets/efub로고1.svg';
import calendarIcon from '../../assets/Calendar.svg';
import checkIcon from "../../assets/checkbox.svg";

const initialData = [
  {
    date: '2026.06.23',
    items: [
      { id: 1, event: '1학기 종강파티', desc: '공간 대여', amount: -50000, type: 'expense' },
      { id: 2, event: '-', desc: '1학기 벌금', amount: 30000, type: 'income' },
    ],
  },
  {
    date: '2026.06.08',
    items: [
      { id: 3, event: '-', desc: '동아리 지원금', amount: 600000, type: 'income' },
    ],
  },
  {
    date: '2026.06.05',
    items: [
      { id: 4, event: '-', desc: '6월 정기 회비', amount: 240000, type: 'income' },
      { id: 5, event: '8월 MT', desc: 'MT 숙소비', amount: -300000, type: 'expense' },
    ],
  },
];

export default function LedgerCreatePage() {
  const navigate = useNavigate(); // 👈 추가!
  const [filter, setFilter] = useState('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('expense'); // 기본값 '지출 (-)'
  const [isFeeCollect, setIsFeeCollect] = useState(false);

  return (
    <div className="account-container">
      {/* 헤더 */}
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

      {/* 필터 영역 */}
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
            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            전체
          </button>
          <button
            className={`tab-btn ${filter === 'income' ? 'active' : ''}`}
            onClick={() => setFilter('income')}
          >
            수입
          </button>
          <button
            className={`tab-btn ${filter === 'expense' ? 'active' : ''}`}
            onClick={() => setFilter('expense')}
          >
            지출
          </button>
        </div>
      </section>

      {/* 목록 테이블 */}
      <main className="transaction-list">
        {initialData.map((group) => {
          const filteredItems = group.items.filter((item) => {
            if (filter === 'income') return item.type === 'income';
            if (filter === 'expense') return item.type === 'expense';
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <section key={group.date} className="date-group">
              <h2 className="date-title">{group.date}</h2>
              <div className="table-card">
                <div className="table-header">
                  <span className="col-event">행사</span>
                  <span className="col-desc">내용</span>
                  <span className="col-amount">금액</span>
                </div>
                {filteredItems.map((item) => (
                  <div key={item.id} className="table-row">
                    <span className="col-event">{item.event}</span>
                    <span className="col-desc">{item.desc}</span>
                    <span className={`col-amount ${item.type}`}>
                      {item.amount > 0 ? `+${item.amount.toLocaleString()}` : item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* 모달 팝업 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">내역 추가</h3>

            <div className="modal-options">
              {/* 수입 (+) */}
              <label 
                className={`type-option ${selectedType === 'income' ? 'selected' : ''}`}
                onClick={() => setSelectedType('income')}
              >
                <input 
                  type="radio" 
                  name="transactionType" 
                  checked={selectedType === 'income'} 
                  onChange={() => setSelectedType('income')} 
                />
                <span className="custom-radio"></span>
                <span className="option-label">수입 (+)</span>
              </label>
              
              {selectedType === 'income' && (
                <label className="fee-checkbox-label">
                    <input 
                    type="checkbox" 
                    checked={isFeeCollect} 
                    onChange={(e) => setIsFeeCollect(e.target.checked)} 
                    />
                    <span className="custom-checkbox">
                    {/* 💡 text '✓' 대신 import한 SVG 이미지를 바인딩 */}
                    {isFeeCollect && <img src={checkIcon} alt="check" className="check-icon" />}
                    </span>
                    <span>회비로 걷기</span>
                </label>
                )}

              {/* 지출 (-) */}
              <label 
                className={`type-option ${selectedType === 'expense' ? 'selected' : ''}`}
                onClick={() => setSelectedType('expense')}
              >
                <input 
                  type="radio" 
                  name="transactionType" 
                  checked={selectedType === 'expense'} 
                  onChange={() => setSelectedType('expense')} 
                />
                <span className="custom-radio"></span>
                <span className="option-label">지출 (-)</span>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn-next" onClick={() => navigate(selectedType === 'expense' ? '/expense' : '/income')}>
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}