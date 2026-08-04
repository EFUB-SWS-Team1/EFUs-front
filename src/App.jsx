import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Onboarding from './pages/auth/Onboarding';
import OrgSelect from './pages/orgSelect'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── 인증/온보딩 (Layout 없음) ── */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/kakao/login" element={<Onboarding />} />
        <Route path="/org-select" element={<OrgSelect />} />

        {/* ── 메인 앱 (Layout + Sidebar) ── */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="event" element={<Event />} />
          <Route path="group-manage" element={<GroupManage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
