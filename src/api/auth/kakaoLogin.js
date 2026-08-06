import axiosInstance from "../axiosInstance";

export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH === "true";

/**
 * mock 로그인 (백엔드/카카오 생략)
 */
export async function mockKakaoLogin() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    accessToken: "mock_access_token_for_dev",
  };
}

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
  if (USE_MOCK_AUTH) {
    return mockKakaoLogin();
  }

  const { data } = await axiosInstance.post("/auth/kakao/login", {
    authorizationCode,
  });
  return data;
}