import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExpenseDetailPage.css';

const ExpenseDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 전달받은 데이터가 없거나 테스트용일 때 보여줄 기본 데이터
  const expenseData = location.state?.expenseData || {
    title: '2월 MT 준비물',
    registrationDate: '2026.02.05',
    amount: '-70,000원',
    date: '2026.02.03',
    event: '2월 MT',
    memo: '-',
    receipt: null,
    history: [],
  };



  return (
    <div className="detail-container">
      {/* 상단 네비게이션 및 수정/삭제 버튼 */}
      <div className="detail-top-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <span className="back-arrow">‹</span> 가계부 목록으로
        </button>
      <div className="action-buttons">
        <button 
            className="btn-action btn-edit" 
            onClick={() => navigate('/expense-edit', { state: { expenseData } })}
          >
            수정
          </button>
          <button className="btn-action btn-delete" onClick={() => { alert('삭제되었습니다.'); navigate('/expense'); }}>
            삭제
          </button>
        </div>
      </div>

      {/* 타이틀 및 금액 영역 */}
      <div className="detail-header-section">
        <div className="title-area">
          <h1 className="detail-main-title">{expenseData.title}</h1>
          <p className="detail-reg-date">등록 {expenseData.registrationDate}</p>
        </div>
        <div className="detail-amount">
          {expenseData.amount}
        </div>
      </div>

      {/* 상세 정보 카드 상자 */}
      <div className="detail-card">
        <div className="detail-grid">
          <div className="detail-item">
            <span className="label">내용</span>
            <span className="value">{expenseData.title}</span>
          </div>
          <div className="detail-item">
            <span className="label">금액</span>
            <span className="value">{expenseData.amount.replace('-', '')}</span>
          </div>
          <div className="detail-item">
            <span className="label">날짜</span>
            <span className="value">{expenseData.date}</span>
          </div>
          <div className="detail-item">
            <span className="label">행사</span>
            <span className="value">{expenseData.event}</span>
          </div>
          <div className="detail-item full-width">
            <span className="label">메모</span>
            <span className="value">{expenseData.memo}</span>
          </div>
        </div>
      </div>

      {/* 영수증 영역 */}
      <div className="detail-section">
        <h3 className="section-heading">영수증</h3>
        <div className="section-box">
          {expenseData.receipt ? (
            <span>{expenseData.receipt}</span>
          ) : (
            '첨부된 영수증이 없습니다'
          )}
        </div>
      </div>

      {/* 수정 이력 영역 */}
      <div className="detail-section">
        <h3 className="section-heading">수정 이력</h3>
        <div className="section-box">
          {expenseData.history && expenseData.history.length > 0 ? (
            <span>이력 있음</span>
          ) : (
            '수정 이력이 없습니다'
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailPage;