import { PermissionBadge } from '../../../components/common';
import styles from './MemberItem.module.css';

const ROLE_LABEL = {
  staff: '운영진',
  general: '일반',
};

export default function MemberItem({ member, isSelected, onClick }) {
  return (
    <button
      type="button"
      className={[styles.item, isSelected ? styles.selected : '']
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
    >
      <div className={styles.avatar} aria-hidden="true" />
      <PermissionBadge variant={member.role === 'staff' ? 'staff' : 'general'}>
        {ROLE_LABEL[member.role] ?? '일반'}
      </PermissionBadge>
      <span className={styles.name}>{member.name}</span>
    </button>
  );
}