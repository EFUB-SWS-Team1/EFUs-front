import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Onboarding from "../pages/auth/Onboarding";
import OrgSelectPage from "../pages/orgSelect/OrgSelectPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EventPage from "../pages/event/EventPage";
import EventDetailPage from "../pages/event/EventDetailPage";
import GroupManagePage from "../pages/groupManage/GroupManagePage";

import LedgerCreatePage from "./pages/ledger/LedgerCreatePage";
import ExpensePage from "./pages/ledger/ExpensePage";
import ExpenseDetailPage from "./pages/ledger/ExpenseDetailPage";
import ExpenseEditPage from "./pages/ledger/ExpenseEditPage";
import IncomePage1 from "./pages/ledger/IncomePage1";
import IncomeDetailPage1 from "./pages/ledger/IncomeDetailPage1";
import IncomeEditPage from "./pages/ledger/IncomeEditPage";
import IncomePage2 from "./pages/ledger/IncomePage2";
import IncomeDetailPage2 from "./pages/ledger/IncomeDetailPage2";

export const router = createBrowserRouter([
  // ── 공개 라우트 (Layout 없음) ──
  {
    path: "/",
    element: <Onboarding />,
  },
  {
  path: "/org-select",
  element: (
    <ProtectedRoute>
      <OrgSelectPage />
    </ProtectedRoute>
  ),
},

  // ── 메인 앱 (로그인 필요) ──
  {
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "events",
        element: <EventPage />,
      },
      {
        path: "events/:eventId",
        element: <EventDetailPage />,
      },
      {
        path: "group-manage",
        element: <GroupManagePage />,
},
      // ── 가계부 관련 라우트 ──
      {
        path: "ledger",
        element: <LedgerPage />, // 혹은 메인 컴포넌트
      },
      {
        path: "ledger/create",
        element: <LedgerCreatePage />,
      },
      {
        path: "ledger/expense",
        element: <ExpensePage />,
      },
      {
        path: "ledger/expense/:id", // 상세/수정 등에 ID가 필요하다면 이 형태일 수 있습니다
        element: <ExpenseDetailPage />,
      },
      {
        path: "ledger/expense/edit/:id",
        element: <ExpenseEditPage />,
      },
      {
        path: "ledger/income1",
        element: <IncomePage1 />,
      },
      {
        path: "ledger/income1/:id",
        element: <IncomeDetailPage1 />,
      },
      {
        path: "ledger/income1/edit/:id",
        element: <IncomeEditPage />,
      },
      {
        path: "ledger/income2",
        element: <IncomePage2 />,
      },
      {
        path: "ledger/income2/:id",
        element: <IncomeDetailPage2 />,
      },
    ],
  },

  // 존재하지 않는 경로 → 온보딩으로
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);