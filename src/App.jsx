import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Onboarding from './pages/auth/Onboarding';

function DummyPage({ title }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: '24px' }}>{title}</h1>
      <p style={{ color: '#888', marginTop: '8px' }}>Sidebar 메뉴 클릭 테스트용 페이지입니다.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
         <Route path="/org-select" element={<OrgSelect />} />

        <Route element={<Layout />}>
          <Route path="dashboard" element={<DummyPage title="대시보드" />} />
          <Route path="ledger" element={<DummyPage title="가계부" />} />
          <Route path="event" element={<DummyPage title="행사" />} />
          <Route path="group-manage" element={<DummyPage title="단체" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}