import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

import DashboardPage from "../pages/dashboard/DashboardPage";
// TODO: pastData(지난 기수 대시보드) 준비되면 아래 두 줄 다시 추가
// import PastGenerationDashboardPage from "../pages/pastData/PastGenerationDashboardPage";

/**
 * router.jsx (dashboard 브랜치 전용 버전)
 *
 * 이 브랜치에는 dashboard 기능만 있어서, 아직 존재하지 않는
 * onboarding/auth/group/ledger/event 등의 페이지는 import하지 않았습니다.
 * develop에 병합될 때 각 담당자의 라우트가 이 파일에 함께 추가되어야 합니다.
 *
 * 지금은 "/" 에 바로 DashboardPage를 붙여서 이 브랜치 단독으로 개발/확인이
 * 가능하게 해뒀습니다. 병합 시 아래 구조를 참고해서 합치면 됩니다:
 *
 *   {
 *     path: "/",
 *     element: <OnboardingPage />
 *   },
 *   {
 *     path: "/auth/callback",
 *     element: <AuthCallbackPage />
 *   },
 *   {
 *     path: "/groups",
 *     element: <ProtectedRoute><GroupListPage /></ProtectedRoute>
 *   },
 *   {
 *     path: "/",
 *     element: <ProtectedRoute><Layout /></ProtectedRoute>,
 *     children: [
 *       { path: "dashboard", element: <DashboardPage /> },
 *       { path: "ledger", element: <LedgerPage /> },
 *       { path: "event", element: <EventPage /> },
 *       { path: "group-manage", element: <GroupManagePage /> },
 *       ...
 *     ]
 *   }
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      // TODO: pastData 준비되면 다시 추가
      // {
      //   path: "past/:generationId",
      //   element: <PastGenerationDashboardPage />,
      // },
    ],
  },
]);