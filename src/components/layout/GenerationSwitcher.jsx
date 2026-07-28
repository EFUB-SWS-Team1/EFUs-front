import { useNavigate } from "react-router-dom";

import useGroup from "../../hooks/useGroup";
import GenerationItem from "./components/GenerationItem";
import logoIcon from "../../assets/efub로고2.svg";
import styles from "./GenerationSwitcher.module.css";

/**
 * GenerationSwitcher
 * "EFUB ▾" 클릭 시 펼쳐지는 기수 목록 드롭다운.
 * 열림/닫힘 상태는 Sidebar가 소유하고, 이 컴포넌트는 표시 + 기수 클릭 시
 * 해당 기수 대시보드로 라우팅하는 역할을 담당.
 * 현재 기수 -> /dashboard, 지난 기수 -> /past/:generationId
 */
export default function GenerationSwitcher({ isOpen, onToggle }) {
  const { currentGeneration, generations, switchGeneration } = useGroup();
  const navigate = useNavigate();

  function handleSelectGeneration(generation) {
    switchGeneration(generation.id);

    if (generation.isCurrent) {
      navigate("/dashboard");
      return;
    }

    // TODO: pastData(지난 기수 대시보드) 준비되면 아래로 교체
    // navigate(`/past/${generation.id}`);
    alert("지난 기수 대시보드는 아직 준비 중이에요.");
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.header} onClick={onToggle}>
        <span className={styles.logoWrapper}>
          <img src={logoIcon} alt="" className={styles.logo} />
        </span>
        <span className={styles.clubName}>EFUB</span>
        <span className={styles.chevron} aria-hidden="true">
          {isOpen ? "⌃" : "⌄"}
        </span>
      </button>

      {isOpen && (
        <ul className={styles.generationList}>
          {generations.map((gen) => (
            <GenerationItem
              key={gen.id}
              name={gen.name}
              isSelected={gen.id === currentGeneration.id}
              onClick={() => handleSelectGeneration(gen)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}