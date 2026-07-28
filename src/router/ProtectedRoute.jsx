import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * ProtectedRoute
 *
 * 로그인 안 된 사용자가 접근하면 온보딩 페이지("/")로 리다이렉트.
 * children으로 감싸서 쓰거나(<ProtectedRoute><X/></ProtectedRoute>),
 * children 없이 <Outlet/>으로 중첩 라우트 형태로도 쓸 수 있게 둘 다 지원.
 *
 * 가정: useAuth()가 { user, isLoading }를 반환.
 *  - isLoading: getMe() 등 인증 확인 중인지
 *  - user: 로그인된 사용자 정보 (없으면 null)
 * 실제 useAuth 구현이 다르면 이 부분만 맞춰 수정하면 됨.
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