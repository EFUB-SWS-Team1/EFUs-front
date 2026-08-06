import axiosInstance from "../axiosInstance";

/**
 * 카카오 OAuth authorize URL 생성
 */
export function getKakaoAuthorizeUrl() {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("VITE_KAKAO_CLIENT_ID 또는 VITE_KAKAO_REDIRECT_URI가 .env에 없습니다.");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
}



export async function loginWithKakaoCode(authorizationCode) {
  const response = await axiosInstance.post("/auth/kakao/login", {
    authorizationCode,
  });

  const loginData = response.data?.data;
  if (typeof loginData?.accessToken !== "string" || !loginData.accessToken) {
    throw new Error("로그인 응답에 유효한 accessToken이 없습니다.");
  }

  return loginData;
}
