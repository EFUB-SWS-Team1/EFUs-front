import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronDown, ChevronUp, FolderPlus } from 'lucide-react';
import './IncomePage1.css';
import calendarIcon from '../../assets/Calendar.svg';
import FolderIcon from '../../assets/Folder plus.svg';

const IncomePage1 = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: '',
    event: '', // 2번 조건: 행사 초기값을 빈 문자열('')로 설정
    memo: '',
    receipt: null
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 행사 추가가 완료되었는지 여부를 관리하는 state (false: 초기 행사 선택 단계, true: 지출 등록 단계)
  const [isEventAdded, setIsEventAdded] = useState(false);

  // 3번 조건: hidden input의 showPicker() 호출을 위한 ref
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

  // 3번 조건: 아이콘 및 날짜 영역 클릭 시 달력 팝업 띄우기
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
    console.log("현재 isEventAdded 상태:", isEventAdded);

    // 1단계: 아직 행사를 '추가'하기 전인 경우
    if (!isEventAdded) {
      if (!formData.event) {
        alert("행사를 선택해주세요.");
        return;
      }
      
      console.log('Submitted Expense Data:', formData);

	    // 1. [요구사항 1] 행사(event) 값은 유지(prev.event)하고, 나머지 항목만 초기화
	    setFormData((prev) => ({
	      title: '',
	      amount: '',
	      date: '',
	      event: prev.event, // 기존에 선택했던 행사는 그대로 유지!
	      memo: '',
	      receipt: null
	    }));
	
  
      // 행사가 선택되었다면 '등록' 단계로 전환!
      setIsEventAdded(true);
      return; // 여기서 멈추고 다음 단계(지출 입력)로 넘어감
    }

    // 2단계: '등록' 단계인 경우 (내용, 금액, 날짜 필수 검사)
    if (!formData.title || !formData.amount || !formData.date) {
      alert("내용, 금액, 날짜는 필수 입력입니다.");
      return;
    }

    console.log('Submitted Final Expense Data:', formData);

 // 상세 페이지로 넘겨줄 데이터 포맷 가공
    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const incomeData = {
      title: formData.title,
      registrationDate: formattedDate,
      amount: `+${formData.amount.replace(/[^0-9]/g, '')}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원',
      date: formData.date,
      event: formData.event || '-',
      memo: formData.memo || '-',
      receipt: formData.receipt ? formData.receipt.name : null,
      history: [],
    };

    navigate('/income-detail', { state: { incomeData } }); 
  };



  return (
    <div className="expense-container">
      <h2 className="expense-title">수입 (+)</h2>

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
          {/* 3번 조건: 연/월/일 글자 지우고 아이콘만 표시 + 클릭 시 달력 오픈 */}
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

          {/* 2번 조건: 처음엔 빈칸, 클릭하면 드롭다운 오픈 */}
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

            {/* 행사 셀렉트 옵션 목록 */}
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

        {/* 1번 조건: 취소/추가 버튼 동일한 크기로 맞춤 + 취소 시 이전 페이지 이동 */}
        {/* 버튼 그룹 (글자가 동적으로 '추가' 또는 '등록'으로 변경됨) */}
        <div className="button-group">
            <button type="button" className="btn btn-cancel" onClick={() => navigate(-1)}>
                취소
            </button>
                <button type="submit" className={`btn btn-submit ${isEventAdded ? 'register-mode' : 'add-mode'}`}>
                {isEventAdded ? '등록' : '추가'} 
            </button>
            </div>
      </form>
    </div>
  );
};

export default IncomePage1;