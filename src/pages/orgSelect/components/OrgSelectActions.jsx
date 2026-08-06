import styles from "./OrgSelectActions.module.css";

export default function OrgSelectActions({ onInviteClick, onCreateClick }) {
  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.inviteBtn} onClick={onInviteClick}>
        초대 코드 입력
      </button>
      <button type="button" className={styles.createBtn} onClick={onCreateClick}>
        단체 생성
      </button>
    </div>
  );
}