import groupIcon from "../../../assets/Users.svg";
import styles from "./OrgEmptyState.module.css";

export default function OrgEmptyState() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.iconBox}>
        <img src={groupIcon} alt="" className={styles.icon} />
      </div>
      <h3 className={styles.title}>소속된 단체가 없어요</h3>
      <p className={styles.description}>
        초대 코드로 단체에 참여하거나
        <br />
        새로운 단체를 만들어보세요
      </p>
    </div>
  );
}