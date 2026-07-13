import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { label: '대시보드', path: '/dashboard' },
  { label: '가계부', path: '/ledger' },
  { label: '예산', path: '/budget' },
  { label: '회비', path: '/dues' },
  { label: '멤버', path: '/member' },
  { label: 'DB', path: '/db' },
];

function Sidebar({ onCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    onCollapse(next); // 부모한테 상태 전달
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.top}>
        {!isCollapsed && (
          <div className={styles.groupName}>
            <span className={styles.groupIcon}>⠿</span>
            <span className={styles.groupLabel}>EFUB</span>
            <span className={styles.groupArrow}>∨</span>
          </div>
        )}
        <button className={styles.collapseBtn} onClick={handleCollapse}>
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.dot} />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.mypage} onClick={() => navigate('/mypage')}>
          <span className={styles.mypageIcon}>👤</span>
          {!isCollapsed && <span>마이페이지</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;