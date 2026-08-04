import { createBrowserRouter, Navigate } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Onboarding from "../pages/auth/Onboarding";
import OrgSelectPage from "../pages/orgSelect/OrgSelectPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EventPage from "../pages/event/EventPage";
import EventDetailPage from "../pages/event/EventDetailPage";
import GroupManagePage from "../pages/groupManage/GroupManagePage";

export const router = createBrowserRouter([
  // ── 공개 라우트 (Layout 없음) ──
  {
    path: "/",
    element: <Onboarding />,
  },
  {
    path: "/kakao/login",
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
    ],
  },

  // 존재하지 않는 경로 → 온보딩으로
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);