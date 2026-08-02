import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExpenseDetailPage.css';
import backArrowIcon from '../../assets/화살표.svg';

const ExpenseDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 전달받은 데이터가 없거나 테스트용일 때 보여줄 기본 데이터
  const [expenseData, setExpenseData] = useState(
    location.state?.expenseData || {
    title: '2월 MT 준비물',
    registrationDate: '2026.02.05',
    amount: '-70,000원',
    date: '2026.02.03',
    event: '2월 MT',
    memo: '-',
    receipt: null,
    history: [],
    isDeleted: false,
    deletedDate: null,
  }
  );

  // [추가] 모달 창 열림/닫힘 상태 관리
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // [추가] 모달에서 삭제 확정 시 실행되는 핸들러 함수
  const handleDeleteConfirm = () => {
    const today = '2026.10.25'; // 예시 삭제 날짜
    
    setExpenseData((prev) => ({
      ...prev,
      isDeleted: true,
      deletedDate: today,
      history: [
        { date: today, author: '홍길동', content: '삭제' },
        ...prev.history,
      ],
    }));
    
    setIsDeleteModalOpen(false); // 모달 닫기
  };

  return (
    <div className="detail-container">
      {/* 상단 네비게이션 및 수정/삭제 버튼 */}
      <div className="detail-top-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <img src={backArrowIcon} alt="뒤로가기" className="back-arrow-svg" /> 가계부 목록으로
        </button>
      <div className="action-buttons">
        <button 
            className="btn-action btn-edit" 
            onClick={() => navigate('/expense-edit', { state: { expenseData } })}
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
            <table className="history-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>이름</th>
                  <th>수정 내용</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.history.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.author}</td>
                    <td>{item.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            '수정 이력이 없습니다'
          )}
        </div>
      </div>

          {isDeleteModalOpen && (
      <div className="modal-overlay">
        <div className="delete-modal">
          <h3>거래 삭제</h3>
          <p>{expenseData.title} 내역을 삭제합니다</p>
          <p className="modal-sub-text">거래를 삭제해도 삭제 이력까지 계속 보관돼요</p>
          <div className="modal-buttons">
            <button className="btn-modal-cancel" onClick={() => setIsDeleteModalOpen(false)}>
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

export default ExpenseDetailPage;