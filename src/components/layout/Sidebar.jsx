import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import GenerationItem from "./components/GenerationItem";
import styles from "./Sidebar.module.css";

import sidebarToggleIcon from "../../assets/Bar_Left.svg";
import groupLogoIcon from "../../assets/efub로고2.svg";
import useGroup from "../../hooks/useGroup";

const NAV_ITEMS = [
  { to: "/dashboard", label: "대시보드" },
  { to: "/ledger", label: "가계부" },
  { to: "/events", label: "행사" },
  { to: "/group-manage", label: "단체" },
];

export default function Sidebar() {
  const {
    currentOrganization,
    terms,
    currentTermId,
    selectTerm,
  } = useGroup();

  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const clubName = currentOrganization?.name ?? "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
    setDropdownOpen(false);
  };

  const handleGenerationSelect = async (id) => {
    await selectTerm(id);
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
          onClick={handleToggle}
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
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <img src={groupLogoIcon} alt="" className={styles.groupLogo} />
            <span className={styles.groupName} title={clubName}>
              {clubName}
            </span>
            <span
              className={[
                styles.chevron,
                dropdownOpen ? styles.chevronOpen : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
          </button>

          {dropdownOpen && (
            <ul className={styles.dropdown} role="listbox">
              {terms.map((term) => {
                const termId = term.termId ?? term.id;
                return (
                  <GenerationItem
                    key={termId}
                    label={term.name}
                    logo={groupLogoIcon}
                    isActive={String(termId) === String(currentTermId)}
                    onClick={() => handleGenerationSelect(termId)}
                  />
                );
              })}
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