import logoIcon from '../../assets/efub로고1.svg';
import logoText from '../../assets/efus-text-logo.svg';
import kakaoIcon from '../../assets/kakao-icon.svg';
import styles from './Onboarding.module.css';

export default function Onboarding() {
  const handleKakaoLogin = () => {
    navigate("/org-select"); 
    
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