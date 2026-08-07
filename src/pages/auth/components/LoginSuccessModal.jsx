import checkIcon from "../../../assets/Check.svg";
import styles from "./LoginSuccessModal.module.css";

export default function LoginSuccessModal({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconBox}>
          <img src={checkIcon} alt="" className={styles.checkIcon} />
        </div>

        <h2 className={styles.title}>로그인이 완료되었어요!</h2>
        <p className={styles.description}>단체 리스트로 이동합니다</p>
      </div>
    </div>
  );
}