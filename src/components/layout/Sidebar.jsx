import { useState } from "react";
import { NavLink } from "react-router-dom";

import GenerationSwitcher from "./GenerationSwitcher";
import sidebarToggleIcon from "../../assets/Bar_Left.svg";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "대시보드", path: "/dashboard" },
  { label: "가계부", path: "/ledger" },
  { label: "행사", path: "/events" },
];

const GROUP_ITEM = { label: "단체", path: "/groups" };

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const [isGenerationMenuOpen, setIsGenerationMenuOpen] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}>
      <button
        type="button"
        className={styles.collapseButton}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
      >
        <img src={sidebarToggleIcon} alt="" className={styles.collapseIcon} />
      </button>

      {!isCollapsed && (
        <GenerationSwitcher
          isOpen={isGenerationMenuOpen}
          onToggle={() => setIsGenerationMenuOpen((prev) => !prev)}
        />
      )}

      {!isGenerationMenuOpen && (
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
                  }
                >
                  <span className={styles.dot} aria-hidden="true" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>

          <NavLink
            to={GROUP_ITEM.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
          >
            <span className={styles.dot} aria-hidden="true" />
            {!isCollapsed && <span>{GROUP_ITEM.label}</span>}
          </NavLink>
        </nav>
      )}
    </aside>
  );
}