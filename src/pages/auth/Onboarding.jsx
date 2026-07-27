import React from 'react';
import { useNavigate } from 'react-router-dom';

// 🔥 피그마에서 각각 따로 내보낸 이미지/아이콘 불러오기
import logoIcon from '../../assets/efub로고1.svg'; // 꽃 모양 로고
import logoText from '../../assets/efus-text-logo.svg'; // 🔥 따로 가져온 EFUs 글씨 로고
import kakaoIcon from '../../assets/kakao-icon.svg'; // 카카오 아이콘

export default function Onboarding() {
  const navigate = useNavigate();

  const handleKakaoLogin = () => {
    // 백엔드 연결 전 임시 토큰 처리
    localStorage.setItem('accessToken', 'mock_kakao_access_token_12345');
    alert('임시 로그인이 완료되었습니다! 대시보드로 이동합니다.');
    
    // 로그인 성공 후 대시보드 페이지로 이동
    navigate('/dashboard'); 
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>온보딩</div>

      <div style={styles.content}>
        {/* 심볼 로고 (꽃 모양) */}
        <img 
          src={logoIcon} 
          alt="EFUs 심볼" 
          style={styles.logoIconImage} 
        />

        {/* 타이틀 로고 (EFUs 글씨체) */}
        <img 
          src={logoText} 
          alt="EFUs" 
          style={styles.logoTextImage} 
        />

        {/* 서브 타이틀 설명 문구 */}
        <p style={styles.subtitle}>우리 단체의 돈을 함께 관리해요</p>

        {/* 카카오 로그인 버튼 */}
        <button onClick={handleKakaoLogin} style={styles.kakaoButton}>
          <img 
            src={kakaoIcon} 
            alt="카카오 아이콘" 
            style={styles.kakaoIconImage} 
          />
          카카오로 시작하기
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#F5F6F8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontFamily: 'sans-serif',
  },
  header: {
    position: 'absolute',
    top: '24px',
    left: '24px',
    color: '#A0A5B1',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  // 🔥 1. 큰 꽃 로고: 크기 160x160 & 아래 여백을 56px로 넉넉하게 넓힘!
  logoIconImage: {
    width: '160px',
    height: '160px',
    objectFit: 'contain',
    marginBottom: '56px', // 🔥 기존 32px -> 56px로 수정하여 시원하게 벌림
  },
  // 🔥 2. EFUs 글씨 로고: width 고정 및 아래 여백을 8px로 좁혀 문구와 붙임
  logoTextImage: {
    width: '120px',
    height: 'auto',
    objectFit: 'contain',
    marginBottom: '8px',  // 🔥 바로 아래 "우리 단체~" 문구와 바짝 붙임
  },
  // 🔥 3. "우리 단체의 돈을 함께 관리해요" 서브타이틀
  subtitle: {
    fontSize: '15px',
    lineHeight: '22px',
    color: '#2B42B6',
    margin: '0 0 52px 0', // 아래 카카오 버튼과의 여백
    fontWeight: '500',
    letterSpacing: '-0.3px',
  },
  // 4. 카카오 시작하기 버튼
  kakaoButton: {
    width: '320px',
    height: '40px',
    backgroundColor: '#FEE500',
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    lineHeight: '19px',
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  kakaoIconImage: {
    width: '18px',
    height: '18px',
    marginRight: '8px',
    objectFit: 'contain',
  },
};