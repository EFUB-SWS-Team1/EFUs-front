import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoIcon from "../../assets/efub로고1.svg";
import logoText from "../../assets/efus-text-logo.svg";
import kakaoIcon from "../../assets/kakao-icon.svg";
import LoginSuccessModal from "./components/LoginSuccessModal";
import { getKakaoAuthorizeUrl, loginWithKakaoCode } from "../../api";
import useAuth from "../../hooks/useAuth";
import styles from "./Onboarding.module.css";

export default function Onboarding() {
  const navigate = useNavigate();
  const { setAuthenticatedUser } = useAuth();
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const processedCodeRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

  const completeLogin = useCallback((data) => {
    localStorage.setItem("accessToken", data.accessToken);
    setAuthenticatedUser(data.user);

    setShowLoginSuccess(true);
    redirectTimeoutRef.current = setTimeout(() => {
      navigate("/org-select");
    }, 1500);
  }, [navigate, setAuthenticatedUser]);

  const handleKakaoLogin = () => {
    try {
      window.location.href = getKakaoAuthorizeUrl();
    } catch (error) {
      console.error(error);
      alert("카카오 로그인 설정이 올바르지 않습니다.");
    }
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code || processedCodeRef.current === code) return;
    processedCodeRef.current = code;

    async function sendCodeToBackend() {
      try {
        const data = await loginWithKakaoCode(code);
        completeLogin(data);
      } catch (error) {
        console.error("로그인 실패:", error.response || error);
        alert("로그인 처리 중 오류가 발생했습니다.");
      }
    }

    sendCodeToBackend();

  }, [completeLogin]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

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
