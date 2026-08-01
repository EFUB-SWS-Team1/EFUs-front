import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import './ExpensePage.css';
import FolderIcon from '../../assets/Folder plus.svg';

const ExpensePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 상세 페이지에서 '수정'을 눌러서 넘어온 데이터가 있는지 확인
  const editingData = location.state?.expenseData || null;

  const [formData, setFormData] = useState({
    title: editingData ? editingData.title : '',
    amount: editingData ? editingData.amount.replace(/[^0-9]/g, '') : '', // '70,000원' -> '70000' 변환
    date: editingData ? editingData.date : '',
    event: editingData ? editingData.event : '',
    memo: editingData && editingData.memo !== '-' ? editingData.memo : '',
    receipt: null
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 수정 모드(#edit)로 들어온 경우 처음부터 지출 등록 단계(true)로 시작
  const [isEventAdded, setIsEventAdded] = useState(editingData ? true : false);

  const dateInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, receipt: file }));
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1단계: 아직 행사를 '추가'하기 전인 경우 (신규 등록 시에만 해당)
    if (!isEventAdded) {
      if (!formData.event) {
        alert("행사를 선택해주세요.");
        return;
      }
      
      setFormData((prev) => ({
        title: '',
        amount: '',
        date: '',
        event: prev.event, 
        memo: '',
        receipt: null
      }));
  
      setIsEventAdded(true);
      return; 
    }

    // 2단계: '등록' 또는 '저장(수정 완료)' 단계
    if (!formData.title || !formData.amount || !formData.date) {
      alert("내용, 금액, 날짜는 필수 입력입니다.");
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const expenseData = {
      title: formData.title,
      registrationDate: editingData ? editingData.registrationDate : formattedDate, // 수정 시 기존 등록일 유지
      amount: `-${formData.amount.replace(/[^0-9]/g, '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원',
      date: formData.date,
      event: formData.event || '-',
      memo: formData.memo ? formData.memo : '-',
      receipt: formData.receipt ? formData.receipt.name : (editingData ? editingData.receipt : null),
      history: [],
    };

    // 저장 후 상세 페이지로 다시 이동하면서 데이터 전달
    navigate('/expense-detail', { state: { expenseData } }); 
  };

  return (
    <div className="expense-container">
      

      <form onSubmit={handleSubmit} className="expense-form">
        {/* 1열: 내용 & 금액 */}
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
            <label>금액 *</label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder=""
            />
          </div>
        </div>

        {/* 2열: 날짜 & 행사 */}
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

        {/* 3열: 메모 */}
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

        {/* 4열: 영수증 업로드 */}
        <div className="form-group full-width">
          <label>영수증</label>
          <label htmlFor="receipt-upload" className="file-upload-area">
            <div className="folder-icon-wrapper">
                <img src={FolderIcon} alt="폴더 아이콘" className="folder-svg" />
            </div>
            <span className="upload-text">
              {formData.receipt ? formData.receipt.name : 'OCR 금액 자동 인식 · JPG, PNG'}
            </span>
            <input
              id="receipt-upload"
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* 하단 버튼 그룹 */}
        <div className="button-group">
          <button type="button" className="btn btn-cancel" onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className="btn btn-submit register-mode">
            {isEventAdded ? '저장' : '추가'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpensePage;