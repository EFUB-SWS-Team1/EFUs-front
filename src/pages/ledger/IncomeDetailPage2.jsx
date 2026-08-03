import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import './IncomeDetailPage2.css';
import backArrowIcon from '../../assets/화살표.svg';

const IncomeDetailPage2 = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [incomeData, setIncomeData] = useState(
    location.state?.incomeData || {
      title: '9월 정기 회비',
      registrationDate: '2026.10.17',
      amount: '500,000원',
      date: '2026.09.09',
      event: '-',
      memo: '-',
      history: [],
      isDeleted: false,
      deletedDate: null,
    }
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [memberList, setMemberList] = useState([
    { id: 1, name: '홍길동', role: '운영진', status: 'pending' },
    { id: 2, name: '홍길동', role: '운영진', status: 'pending' },
    { id: 3, name: '홍길동', role: '운영진', status: 'pending' },
    { id: 4, name: '홍길동', role: '일반', status: 'pending' },
    { id: 5, name: '홍길동', role: '일반', status: 'pending' },
    { id: 6, name: '홍길동', role: '일반', status: 'pending' },
  ]);

  const handleStatusToggle = (id) => {
    setMemberList(prev => 
      prev.map(m => m.id === id ? { ...m, status: m.status === 'pending' ? 'completed' : 'pending' } : m)
    );
  };

  const handleAllComplete = () => {
    setMemberList(prev => prev.map(m => ({ ...m, status: 'completed' })));
  };

  const completedCount = memberList.filter(m => m.status === 'completed').length;
  const pendingCount = memberList.filter(m => m.status === 'pending').length;
  const paidAmountSum = `${(completedCount * 250000).toLocaleString()}원`;

  const filteredMembers = memberList.filter(m => m.name.includes(searchTerm));

  const handleDeleteConfirm = () => {
    const today = '2026.10.25';
    setIncomeData((prev) => ({
      ...prev,
      isDeleted: true,
      deletedDate: today,
      history: [
        { date: today, author: '홍길동', content: '삭제' },
        ...prev.history,
      ],
    }));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="detail-container">
      {/* 상단 네비게이션 */}
      <div className="detail-top-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <img src={backArrowIcon} alt="뒤로가기" className="back-arrow-svg" /> 가계부 목록으로
        </button>
        <div className="action-buttons">
          <button 
            className="btn-action btn-edit" 
            onClick={() => navigate('/income-edit', { state: { incomeData } })}
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
        <div className="title-area" style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className={`detail-main-title ${incomeData.isDeleted ? 'deleted-text' : ''}`}>
            {incomeData.title}
          </h1>
          {incomeData.isDeleted ? (
            <p className="deleted-date-text" style={{ margin: 0 }}>삭제된 날짜 {incomeData.deletedDate}</p>
          ) : (
            <p className="detail-reg-date" style={{ margin: 0 }}>등록된 날짜 {incomeData.registrationDate}</p>
          )}
        </div>
        <div className={`detail-amount ${incomeData.isDeleted ? 'deleted-text' : ''}`}>
          {incomeData.amount}
        </div>
      </div>

      {/* 상세 정보 카드 */}
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

      {/* 수정 이력 */}
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
            '수정 이력이 없습니다'
          )}
        </div>
      </div>

      {/* 💡 요약 카드 3개 박스 영역 */}
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

      {/* 💡 납부 현황 섹션 (검색창이 박스 바깥으로 분리됨) */}
      <div className="detail-section">
        <h3 className="payment-section-title" style={{ marginBottom: '16px' }}>납부 현황</h3>
        
        {/* 검색창과 전체 납부 처리 버튼 (박스 밖 상단) */}
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
          <button type="button" className="btn-bulk-select" onClick={handleAllComplete}>
            전체 납부 처리
          </button>
        </div>

        {/* 하단 리스트가 담기는 하얀색 테두리 박스 */}
        <div className="target-select-box">
          <div className="target-list-grid">
            {filteredMembers.map((member) => {
              const isCompleted = member.status === 'completed';
              return (
                <div key={member.id} className={`target-item ${isCompleted ? 'checked' : ''}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${member.role === '운영진' ? 'admin' : 'general'}`}>
                      {member.role}
                    </span>
                    <span className="target-name">{member.name}</span>
                  </div>
                  <button 
                    type="button" 
                    className={`status-badge-btn ${isCompleted ? 'completed' : 'pending'}`}
                    onClick={() => handleStatusToggle(member.id)}
                  >
                    {isCompleted ? '완료' : '미납'}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pagination-mock">
            <span>1 / 3</span>
            <span className="page-arrow">&gt;</span>
          </div>
        </div>
      </div>

      {/* 삭제 모달 */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>거래 삭제</h3>
            <p>{incomeData.title} 내역을 삭제합니다</p>
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

export default IncomeDetailPage2;