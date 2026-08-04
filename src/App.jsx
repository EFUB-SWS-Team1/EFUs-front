import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Onboarding from './pages/auth/Onboarding';
import OrgSelect from './pages/auth/OrgSelect'; 
import Dashboard from './pages/dashboard/Dashboard';
import Event from './pages/event/Event';
import GroupManage from './pages/group/GroupManage';
import LedgerCreatePage from "./pages/ledger/LedgerCreatePage";
import ExpensePage from "./pages/ledger/ExpensePage";
import ExpenseDetailPage from "./pages/ledger/ExpenseDetailPage";
import ExpenseEditPage from "./pages/ledger/ExpenseEditPage";
import IncomePage1 from "./pages/ledger/IncomePage1";
import IncomeDetailPage1 from "./pages/ledger/IncomeDetailPage1";
import IncomeEditPage from "./pages/ledger/IncomeEditPage";
import IncomePage2 from "./pages/ledger/IncomePage2";
import IncomeDetailPage2 from "./pages/ledger/IncomeDetailPage2";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── 인증/온보딩 (Layout 없음) ── */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/org-select" element={<OrgSelect />} />

        {/* ── 메인 앱 (Layout + Sidebar) ── */}
        <Route element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="event" element={<Event />} />
          <Route path="group-manage" element={<GroupManage />} />
          <Route index element={<LedgerCreatePage />} />
          <Route path="ledger" element={<LedgerCreatePage />} />
          <Route path="expense" element={<ExpensePage />} />
          <Route path="/expense-detail" element={<ExpenseDetailPage />} />
          <Route path="/expense-edit" element={<ExpenseEditPage />} />
          <Route path="/income" element={<IncomePage1 />} />
          <Route path="/income-detail" element={<IncomeDetailPage1 />} />
          <Route path="/income-edit" element={<IncomeEditPage />} />
          <Route path="/income2" element={<IncomePage2 />} />
          <Route path="/income-detail2" element={<IncomeDetailPage2 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
