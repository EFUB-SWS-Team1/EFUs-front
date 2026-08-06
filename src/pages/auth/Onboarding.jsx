import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/efub로고1.svg";
import logoText from "../../assets/efus-text-logo.svg";
import kakaoIcon from "../../assets/kakao-icon.svg";
import LoginSuccessModal from "./components/LoginSuccessModal";
import {
  USE_MOCK_AUTH,
  getKakaoAuthorizeUrl,
  loginWithKakaoCode,
} from "../../api/auth/kakaoLogin";
import styles from "./Onboarding.module.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  /** 로그인 성공 후 공통 처리 (mock / 실제 API 동일) */
  const completeLogin = (data) => {
    localStorage.setItem("accessToken", data.accessToken);

    setShowLoginSuccess(true);
    setTimeout(() => {
      navigate("/org-select");
    }, 1500);
  };

  const handleKakaoLogin = async () => {
    // mock: 카카오 페이지 안 거침
    if (USE_MOCK_AUTH) {
      try {
        const data = await loginWithKakaoCode("mock_code");
        completeLogin(data);
      } catch (error) {
        console.error("mock 로그인 실패:", error);
        alert("mock 로그인 중 오류가 발생했습니다.");
      }
      return;
    }

    // 실제: 카카오 로그인 페이지로 이동
    try {
      window.location.href = getKakaoAuthorizeUrl();
    } catch (error) {
      console.error(error);
      alert("카카오 로그인 설정이 올바르지 않습니다.");
    }
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      sendCodeToBackend(code);
    }
  }, []);

  const sendCodeToBackend = async (code) => {
    try {
      const data = await loginWithKakaoCode(code);
      completeLogin(data);
    } catch (error) {
      console.error("로그인 실패:", error.response || error);
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
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

      <LoginSuccessModal isOpen={showLoginSuccess} />
    </>
  );
}