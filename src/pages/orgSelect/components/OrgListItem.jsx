import { useState } from "react";
import orgLogo from "../../../assets/efub로고2.svg";
import usersIcon from "../../../assets/Users.svg";
import styles from "./OrgListItem.module.css";

export default function OrgListItem({ org, onEnter }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <li
      className={[styles.item, isActive ? styles.active : ""].filter(Boolean).join(" ")}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className={styles.logoBox}>
        <img src={org.logo ?? orgLogo} alt="" className={styles.logo} />
      </div>

      <div className={styles.info}>
        <span className={styles.name}>{org.name}</span>
        <span className={styles.memberCount}>
          <img src={usersIcon} alt="" className={styles.memberIcon} />
          {org.memberCount}
        </span>
      </div>

      {isActive && (
        <button type="button" className={styles.enterBtn} onClick={() => onEnter(org.id)}>
          입장하기 →
        </button>
      )}
    </li>
  );
}