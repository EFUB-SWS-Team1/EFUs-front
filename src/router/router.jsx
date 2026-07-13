import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import OnboardingPage from '../pages/auth/onboardingPage';
import LoginPage from '../pages/auth/LoginPage';
import GroupListPage from '../pages/group/GroupListPage';
import DashboardPage from '../pages/dashboard/DashboardPage';

const router = createBrowserRouter([
  // 레이아웃 없는 페이지 (사이드바 X)
  { path: '/onboarding', element: <OnboardingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/groups', element: <GroupListPage /> },

  // 레이아웃 있는 페이지 (사이드바 O)
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      // 나중에 여기에 가계부, 예산, 회비, 멤버, DB 추가
    ],
  },
]);

export default router;