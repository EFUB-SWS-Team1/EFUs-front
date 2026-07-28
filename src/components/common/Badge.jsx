import styles from "./Badge.module.css";

/**
 * Badge.jsx
 *
 * 상태를 나타내는 알약 모양 태그.
 * variant: neutral(나가기) | success(진행 중/전원 납부) | warning(N% 초과) | danger(예산 초과/미납)
 *
 * 사용 예:
 *  <Badge variant="success">진행 중</Badge>
 *  <Badge variant="warning">80% 초과</Badge>
 */
export default function Badge({ variant = "neutral", children, className = "" }) {
  const variantClass = styles[variant] ?? styles.neutral;

  return <span className={`${styles.badge} ${variantClass} ${className}`}>{children}</span>;
}