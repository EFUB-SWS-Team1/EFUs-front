import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout() {
  const [activeGenerationId, setActiveGenerationId] = useState(6);

  return (
    <div className={styles.layout}>
      <Sidebar
        activeGenerationId={activeGenerationId}
        onGenerationChange={setActiveGenerationId}
      />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}