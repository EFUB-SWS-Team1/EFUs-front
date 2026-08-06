import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * ProtectedRoute
 *
 * 로그인 안 된 사용자가 접근하면 온보딩 페이지("/")로 리다이렉트.
*/

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 32, color: "#8b8fa3", fontSize: 14 }}>로그인 확인 중...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children ?? <Outlet />;
}