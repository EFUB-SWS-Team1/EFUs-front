import settingsIcon from "../../../assets/Settings.svg";
import styles from "./ProfileHeader.module.css";

export default function ProfileHeader({ user }) {
  return (
    <header className={styles.header}>
      <div className={styles.profileInfo}>
        <div className={styles.avatar}>
          {user?.profileImageUrl && (
            <img src={user.profileImageUrl} alt="" className={styles.avatarImage} />
          )}
        </div>

        <div className={styles.userText}>
          <h2 className={styles.name}>{user?.name ?? "사용자"}</h2>
          <p className={styles.email}>{user?.email ?? ""}</p>
        </div>
      </div>

      <button type="button" className={styles.settingsBtn} aria-label="설정">
        <img src={settingsIcon} alt="" className={styles.settingsIcon} />
      </button>
    </header>
  );
}