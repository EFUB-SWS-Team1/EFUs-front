import styles from "./ProgressBar.module.css";

/**
 * percent: 0~100 (100 초과 시 100으로 clamp, 실제 초과 여부는 variant 색으로만 표현)
 * variant: 'default'(보라, 정상) | 'danger'(빨강, 예산 초과)
 */
export default function ProgressBar({ percent = 0, variant = "default", className = "" }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const barClass = variant === "danger" ? styles.barDanger : styles.barDefault;

  return (
    <div className={`${styles.track} ${className}`}>
      <div className={`${styles.bar} ${barClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}