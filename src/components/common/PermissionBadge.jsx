import styles from './PermissionBadge.module.css';

const VARIANTS = {
  staff: styles.staff,       // 운영진
  general: styles.general,   // 일반
  danger: styles.danger,     // 나가기, 예산초과, 미납, 미납 N명
  warning: styles.warning,   // 80% 초과
  success: styles.success,   // 진행 중, 전원납부, 납부
};

// 라벨 → variant 매핑 (선택)
const LABEL_VARIANT_MAP = {
  '나가기': 'danger',
  '예산 초과': 'danger',
  '80% 초과': 'warning',
  '진행 중': 'success',
  '전원 납부': 'success',
  '운영진': 'staff',
  '일반': 'general',
  '미납': 'danger',
  '납부': 'success',
};

export default function PermissionBadge({
  variant,
  children,
  className = '',
}) {
  const resolvedVariant =
    variant ??
    LABEL_VARIANT_MAP[children] ??
    'general';

  const classes = [
    styles.badge,
    VARIANTS[resolvedVariant] ?? VARIANTS.general,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={classes}>{children}</span>;
}