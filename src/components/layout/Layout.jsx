import { Navigate, Outlet } from "react-router-dom";
import useGroup from "../../hooks/useGroup";
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout() {
  const { currentOrganization, isGroupLoading } = useGroup();

  if (isGroupLoading) return <div>단체 정보를 불러오는 중...</div>;
  if (!currentOrganization) return <Navigate to="/org-select" replace />;

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
