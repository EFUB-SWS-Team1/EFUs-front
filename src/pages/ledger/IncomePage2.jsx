import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import './IncomePage2.css';

const IncomePage2 = () => {
  const navigate = useNavigate();

  // 1번 조건: 청구 방식 선택 ('individual' 또는 'nppang')
  const [billingType, setBillingType] = useState('individual');

  const [formData, setFormData] = useState({
    title: '',
    amount: '', // 개별 청구일 때는 1인당 금액, N빵 청구일 때는 총 금액 역할
    date: '',
    event: '',
    memo: '',
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dateInputRef = useRef(null);

  // 3번 조건 & 화면 이미지 참고: 청구 대상 관련 state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTargets, setSelectedTargets] = useState([]);

  // 임시 회원 목록 데이터 (이미지 참고)
  const memberList = [
    { id: 1, name: '홍길동', role: '운영진' },
    { id: 2, name: '홍길동', role: '운영진' },
    { id: 3, name: '홍길동', role: '운영진' },
    { id: 4, name: '홍길동', role: '일반' },
    { id: 5, name: '홍길동', role: '일반' },
    { id: 6, name: '홍길동', role: '일반' },
    { id: 7, name: '홍길동', role: '일반' },
    { id: 8, name: '홍길동', role: '일반' },
    { id: 9, name: '홍길동', role: '일반' },
    { id: 10, name: '홍길동', role: '일반' },
  ];

  // ⭐ '운영진'이 일반보다 앞으로 오도록 정렬하는 로직 추가
  const sortedMemberList = [...memberList].sort((a, b) => {
    if (a.role === '운영진' && b.role !== '운영진') return -1;
    if (a.role !== '운영진' && b.role === '운영진') return 1;
    return 0;
  });

  const eventOptions = [
    '2월 MT',
    '1학기 종강파티',
    '8월 MT',
    '여름방학 해커톤'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectEvent = (option) => {
    setFormData((prev) => ({ ...prev, event: option }));
    setIsDropdownOpen(false);
  };

  const handleDateClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
      }
    }
  };

  // 청구 대상 선택 토글 함수
  const handleTargetToggle = (id) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 전체 일괄 청구 버튼
  const handleSelectAll = () => {
    if (selectedTargets.length === memberList.length) {
      setSelectedTargets([]);
    } else {
      setSelectedTargets(memberList.map((m) => m.id));
    }
  };

  // 4번 조건: 전체 청구 금액 계산
  const calculateTotalAmount = () => {
    const rawAmount = parseInt(formData.amount.replace(/[^0-9]/g, ''), 10) || 0;
    if (billingType === 'individual') {
      return rawAmount * selectedTargets.length;
    } else {
      return rawAmount;
    }
  };

  const totalCalculated = calculateTotalAmount();
  const formattedTotalAmount = totalCalculated > 0 
    ? `${totalCalculated.toLocaleString()}원` 
    : '- 원';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.date) {
      alert("내용, 금액, 날짜는 필수 입력입니다.");
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const incomeData = {
      billingType,
      title: formData.title,
      registrationDate: formattedDate,
      amount: formattedTotalAmount,
      date: formData.date,
      event: formData.event || '-',
      memo: formData.memo || '-',
      targetCount: selectedTargets.length,
      history: [],
    };

    navigate('/income-detail', { state: { incomeData } });
  };

  return (
    <div className="expense-container">
      <h2 className="expense-title">수입 (+)</h2>

      {/* 1번 조건: 개별 청구 / N빵 청구 탭 영역 */}
      <div className="billing-type-container">
        <div 
          className={`billing-card ${billingType === 'individual' ? 'active' : ''}`}
          onClick={() => setBillingType('individual')}
        >
          <div className="billing-card-header">
            <span className="custom-radio"></span>
            <span className="billing-card-title">개별 청구</span>
          </div>
          <p className="billing-card-desc">1인당 금액을 직접 지정</p>
        </div>

        <div 
          className={`billing-card ${billingType === 'nppang' ? 'active' : ''}`}
          onClick={() => setBillingType('nppang')}
        >
          <div className="billing-card-header">
            <span className="custom-radio"></span>
            <span className="billing-card-title">N빵 청구</span>
          </div>
          <p className="billing-card-desc">총 금액을 인원수로 균등 분할</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="expense-form">
        {/* 내용 & 금액 */}
        <div className="form-row">
          <div className="form-group">
            <label>내용 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder=""
            />
          </div>

          <div className="form-group">
            <label>{billingType === 'individual' ? '1인당 금액 *' : '총 금액 *'}</label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder=""
            />
          </div>
        </div>

        {/* 날짜 & 행사 */}
        <div className="form-row">
          <div className="form-group">
            <label>날짜 *</label>
            <div className="custom-date-box" onClick={handleDateClick}>
              <Calendar className="calendar-icon-only" size={16} />
              <span className="selected-date-text">{formData.date}</span>
              <input
                ref={dateInputRef}
                type="date"
                name="date"
                className="hidden-date-input"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group relative">
            <label>행사</label>
            <div 
              className={`custom-select ${isDropdownOpen ? 'open' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{formData.event}</span>
              {isDropdownOpen ? (
                <ChevronUp className="icon dropdown-icon" size={18} />
              ) : (
                <ChevronDown className="icon dropdown-icon" size={18} />
              )}
            </div>

            {isDropdownOpen && (
              <ul className="dropdown-menu">
                {eventOptions.map((option) => (
                  <li 
                    key={option} 
                    className={formData.event === option ? 'selected' : ''}
                    onClick={() => handleSelectEvent(option)}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* 메모 */}
        <div className="form-group full-width">
          <label>메모</label>
          <input
            type="text"
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            placeholder=""
          />
        </div>

        {/* 3번 조건: 청구 대상 칸 (검색창은 박스 밖으로 분리됨) */}
        <div className="form-group full-width">
          <label>청구 대상 *</label>
          
          {/* 검색창과 일괄 청구 버튼은 박스 위쪽으로 분리 */}
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
            <button type="button" className="btn-bulk-select" onClick={handleSelectAll}>
              전체 일괄 청구
            </button>
          </div>

          {/* 하단 목록 영역만 target-select-box 안으로 감싸기 */}
          <div className="target-select-box">
            <div className="target-count-text">
              <strong>{selectedTargets.length}명</strong> 선택됨
            </div>

            <div className="target-list-grid">
              {sortedMemberList.map((member) => {
                const isChecked = selectedTargets.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className={`target-item ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleTargetToggle(member.id)}
                  >
                    <div className={`checkbox-custom ${isChecked ? 'checked' : ''}`}>
                      {isChecked && <Check size={12} color="#fff" />}
                    </div>
                    <span className={`badge ${member.role === '운영진' ? 'admin' : 'general'}`}>
                      {member.role}
                    </span>
                    <span className="target-name">{member.name}</span>
                  </div>
                );
              })}
            </div>
            
            <div className="pagination-mock">
              <span>1 / 2</span>
              <span className="page-arrow">&gt;</span>
            </div>
          </div>
        </div>

        {/* 4번 조건: 전체 청구 금액 칸 */}
        <div className="total-billing-summary-box">
          <div className="total-billing-left">
            <div className="total-billing-title">전체 청구 금액</div>
            <div className="total-billing-formula">
              {billingType === 'individual' ? '1인당 금액 × 인원 수' : 'N빵 총 분할 금액'}
            </div>
          </div>
          <div className="total-billing-value">{formattedTotalAmount}</div>
        </div>

        {/* 버튼 그룹 */}
        <div className="button-group">
          <button type="button" className="btn btn-cancel" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="btn btn-submit register-mode">
            등록
          </button>
        </div>
      </form>
    </div>
  );
};

export default IncomePage2;