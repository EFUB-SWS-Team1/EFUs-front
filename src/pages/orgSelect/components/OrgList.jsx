import OrgListItem from "./OrgListItem";
import styles from "./OrgList.module.css";

export default function OrgList({ organizations, onEnter }) {
  return (
    <ul className={styles.list}>
      {organizations.map((org) => (
        <OrgListItem key={org.id} org={org} onEnter={onEnter} />
      ))}
    </ul>
  );
}