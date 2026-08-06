import axiosInstance from "../axiosInstance";

/**
 * 로그아웃
 * POST /api/auth/logout
 * 백엔드에서 Refresh Token 쿠키를 삭제하고, 프론트엔드에서는 Access Token을 지운다.
 */
export async function kakaoLogout() {
  await axiosInstance.post("/auth/logout");
  localStorage.removeItem("accessToken");
}