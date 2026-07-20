import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import styles from "./Layout.module.css";

/**
 * Layout
 * Sidebar + Outlet 감싸는 틀. isCollapsed 상태를 여기서 소유해서
 * Sidebar 너비와 main 여백을 같이 조정.
 */
export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed((prev) => !prev)} />
      <main className={`${styles.main} ${isCollapsed ? styles.mainCollapsed : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}