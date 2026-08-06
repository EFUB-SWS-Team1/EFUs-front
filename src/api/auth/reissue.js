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

  const newAccessToken =
    data.accessToken ?? data.access_token ?? data?.data?.accessToken;

  if (!newAccessToken) {
    throw new Error("accessToken이 응답에 없습니다.");
  }

  localStorage.setItem("accessToken", newAccessToken);
  return newAccessToken;
}