import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import logoIcon from '../../assets/efub로고1.svg';
import logoText from '../../assets/efus-text-logo.svg';
import kakaoIcon from '../../assets/kakao-icon.svg';
import styles from './Onboarding.module.css';
import axios from 'axios';

const BASE_URL = 'http://172.30.1.69:8080';
const KAKAO_CLIENT_ID = '6b7c585b2c55580adde574170c44d698'; 

// [주의] 프론트엔드가 카카오 로그인 창을 띄울 때 쓰는 주소는
// 백엔드 팀원이 서버 환경설정에 등록해 둔 Redirect URI와 단 한 글자도 틀림없이 일치해야 합니다!
const REDIRECT_URI = 'http://localhost:5173/kakao/login'; 

export default function Onboarding() {
  const navigate = useNavigate();

  // 1단계: 카카오 로그인 페이지로 이동
  const handleKakaoLogin = () => {
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoURL;
  };

  // 2단계: 카카오에서 돌아왔을 때 주소창의 code를 순수 JS로 안전하게 추출
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    console.log('추출된 인가 코드:', code);
    
    if (code) {
      sendCodeToBackend(code);
    }
  }, []);

  // 3단계: 명세서에 맞춘 백엔드 통신
  const sendCodeToBackend = async (code) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/kakao/login`, {
        authorizationCode: code, // 명세서 요구사항 반영
      }, {
        withCredentials: true // 🍪 백엔드가 쿠키(refreshToken)를 줄 때 필수!
      });

      // 명세서 Response Content에 따른 데이터 저장
      localStorage.setItem('accessToken', response.data.accessToken);
      
      console.log('로그인 성공 데이터:', response.data);
      alert('로그인이 완료되었습니다! 조직 선택 페이지로 이동합니다.');
      
      navigate('/org-select');

    } catch (error) {
      console.error('로그인 실패 상세:', error.response || error);
      alert('로그인 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src={logoIcon} alt="EFUs 심볼" className={styles.logoIcon} />
        <img src={logoText} alt="EFUs" className={styles.logoText} />
        <p className={styles.subtitle}>우리 단체의 돈을 함께 관리해요</p>

        <button type="button" onClick={handleKakaoLogin} className={styles.kakaoButton}>
          <img src={kakaoIcon} alt="" className={styles.kakaoIcon} />
          카카오로 시작하기
        </button>
      </div>
    </div>
  );
}