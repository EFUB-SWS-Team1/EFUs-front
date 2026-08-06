import axios from "axios";

/**
 * Refresh Token(쿠키)으로 Access Token 재발급
 * POST /api/auth/reissue
 * 순수 axios 호출
 */
export async function reissue() {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

  const { data } = await axios.post(
    `${baseURL}/auth/reissue`,
    null,
    { withCredentials: true },
  );

  const accessToken = data?.data?.accessToken;

  if (typeof accessToken !== "string" || !accessToken.trim()) {
    throw new Error("accessToken이 응답에 없습니다.");
  }

  // 백엔드 응답이 `Bearer <token>` 또는 순수 토큰 어느 형태여도
  // localStorage에는 순수 토큰만 저장한다.
  const newAccessToken = accessToken.trim().replace(/^Bearer\s+/i, "");
  localStorage.setItem("accessToken", newAccessToken);
  return newAccessToken;
}
