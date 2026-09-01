import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../api";
import useStaleRefresh from "../hooks/useStaleRefresh";
import { AuthContext } from "./AuthStateContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) return;

    try {
      const restoredUser = await getCurrentUser();
      if (restoredUser) setUser(restoredUser);
    } catch {
      // 주기 갱신 실패는 유지. 401은 axios에서 auth:unauthorized로 처리한다.
    }
  }, []);

  useStaleRefresh(refreshUser);

  useEffect(() => {
    let isActive = true;

    async function restoreAuth() {
      if (!localStorage.getItem("accessToken")) {
        if (isActive) setIsLoading(false);
        return;
      }

      try {
        const restoredUser = await getCurrentUser();
        if (!restoredUser) throw new Error("사용자 정보가 없습니다.");
        if (isActive) setUser(restoredUser);
      } catch {
        if (isActive) clearAuth();
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    restoreAuth();
    window.addEventListener("auth:unauthorized", clearAuth);

    return () => {
      isActive = false;
      window.removeEventListener("auth:unauthorized", clearAuth);
    };
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      setAuthenticatedUser: setUser,
      clearAuth,
    }),
    [clearAuth, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}