import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import './IncomeEditPage.css';
import FolderIcon from '../../assets/Folder plus.svg';

const IncomeEditPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 상세 페이지에서 '수정'을 눌러서 넘어온 수입 데이터 확인
  const editingData = location.state?.incomeData || null;

  const [formData, setFormData] = useState({
    title: editingData ? editingData.title : '',
    amount: editingData ? editingData.amount.replace(/[^0-9]/g, '') : '', // '+100,000원' -> '100000' 변환
    date: editingData ? editingData.date : '',
    event: editingData ? editingData.event : '',
    memo: editingData && editingData.memo !== '-' ? editingData.memo : '',
    receipt: null
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 수정 모드로 들어온 경우 처음부터 등록 단계(true)로 시작
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

    if (!formData.title || !formData.amount || !formData.date) {
      alert("내용, 금액, 날짜는 필수 입력입니다.");
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    
    const newHistoryItems = [];

    if (editingData) {
      const cleanOldMemo = (!editingData.memo || editingData.memo === '-') ? '' : String(editingData.memo).trim();
      const cleanNewMemo = (!formData.memo || formData.memo === '-') ? '' : String(formData.memo).trim();

      if (cleanNewMemo !== '' && cleanOldMemo === '') {
        newHistoryItems.push('메모 추가');
      } else if (cleanNewMemo !== cleanOldMemo) {
        newHistoryItems.push('메모 수정');
      }
      
      if (formData.receipt && !editingData.receipt) {
        newHistoryItems.push('영수증 추가');
      } else if (formData.receipt && formData.receipt.name !== editingData.receipt) {
        newHistoryItems.push('영수증 수정');
      }

      const cleanedOldAmount = editingData.amount.replace(/[^0-9]/g, '');
      const cleanedNewAmount = formData.amount.replace(/[^0-9]/g, '');
      if (cleanedOldAmount !== cleanedNewAmount) {
        newHistoryItems.push('가격 수정');
      }

      if (formData.event !== editingData.event) {
        newHistoryItems.push('행사 수정');
      }

      if (formData.title !== editingData.title) {
        newHistoryItems.push('내용 수정');
      }
    }

    const addedHistoryList = newHistoryItems.map(content => ({
      date: formattedDate,
      author: '홍길동',
      content: content
    }));

    const incomeData = {
      title: formData.title,
      registrationDate: editingData ? editingData.registrationDate : formattedDate,
      amount: `+${formData.amount.replace(/[^0-9]/g, '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원', // 수입이므로 + 부호 붙임
      date: formData.date,
      event: formData.event || '-',
      memo: formData.memo ? formData.memo : '-',
      receipt: formData.receipt ? formData.receipt.name : (editingData ? editingData.receipt : null),
      history: [...(editingData?.history || []), ...addedHistoryList],
    };

    // 저장 후 수입 상세 페이지로 다시 이동하면서 데이터 전달
    navigate('/income-detail', { state: { incomeData } }); 
  };

  return (
    <div className="income-edit-container">
      <form onSubmit={handleSubmit} className="income-edit-form">
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

export default IncomeEditPage;