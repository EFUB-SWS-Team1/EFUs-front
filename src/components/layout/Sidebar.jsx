import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import GenerationItem from "./components/GenerationItem";
import styles from "./Sidebar.module.css";

import sidebarToggleIcon from "../../assets/Bar_Left.svg";
import groupLogoIcon from "../../assets/efub로고2.svg";

const NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/ledger", label: "가계부" },
  { to: "/event", label: "행사" },
  { to: "/group-manage", label: "단체" },
];

export default function Sidebar({
  generations = [
    { id: 6, label: "EFUB 6기" },
    { id: 5, label: "EFUB 5기" },
    { id: 4, label: "EFUB 4기" },
    { id: 3, label: "EFUB 3기" },
  ],
  activeGenerationId = 6,
  onGenerationChange,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeGeneration =
    generations.find((g) => g.id === activeGenerationId) ?? generations[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (collapsed) setDropdownOpen(false);
  }, [collapsed]);

  const handleGenerationSelect = (id) => {
    onGenerationChange?.(id);
    setDropdownOpen(false);
  };

  return (
    <aside
      className={[styles.sidebar, collapsed ? styles.collapsed : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={collapsed ? styles.collapsedHeader : styles.expandedHeader}
      >
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          <img src={sidebarToggleIcon} alt="" className={styles.toggleIcon} />
        </button>
      </div>

      {!collapsed && (
        <div className={styles.groupSelector} ref={dropdownRef}>
          <button
            type="button"
            className={styles.groupBtn}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <img src={groupLogoIcon} alt="" className={styles.groupLogo} />
            <span className={styles.groupName}>EFUB</span>
            <span
              className={[
                styles.chevron,
                dropdownOpen ? styles.chevronOpen : "",
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </button>

          {dropdownOpen && (
            <ul className={styles.dropdown}>
              {generations.map((gen) => (
                <GenerationItem
                  key={gen.id}
                  label={gen.label}
                  logo={groupLogoIcon}
                  isActive={gen.id === activeGenerationId}
                  onClick={() => handleGenerationSelect(gen.id)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [styles.navItem, isActive ? styles.navItemActive : ""]
                .filter(Boolean)
                .join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={[styles.dot, isActive ? styles.dotActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                />
                <span className={styles.navLabel}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
