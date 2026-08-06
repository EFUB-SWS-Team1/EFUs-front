import axios from "axios";
import { reissue } from "./auth/reissue";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // refreshToken 쿠키
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = normalizeAccessToken(
      localStorage.getItem("accessToken"),
    );
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let refreshPromise = null;

function normalizeAccessToken(accessToken) {
  if (typeof accessToken !== "string") return null;

  const normalizedToken = accessToken.trim().replace(/^Bearer\s+/i, "");
  return normalizedToken || null;
}

function getAuthorizationHeader(headers) {
  if (typeof headers?.get === "function") {
    return headers.get("Authorization");
  }

  return headers?.Authorization ?? headers?.authorization;
}

function getBearerToken(headers) {
  const authorization = getAuthorizationHeader(headers);
  return normalizeAccessToken(authorization);
}

function retryWithAccessToken(config, accessToken) {
  const normalizedToken = normalizeAccessToken(accessToken);
  if (!normalizedToken) {
    return Promise.reject(new Error("유효한 accessToken이 없습니다."));
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${normalizedToken}`;
  return axiosInstance(config);
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = reissue()
      .catch((error) => {
        localStorage.removeItem("accessToken");
        window.dispatchEvent(new Event("auth:unauthorized"));
        window.location.href = "/";
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!config || response?.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    const failedAccessToken = getBearerToken(config.headers);
    const currentAccessToken = normalizeAccessToken(
      localStorage.getItem("accessToken"),
    );

    // A request sent with the old token can receive its 401 after another
    // request has already completed reissue. Retry it with the current token
    // instead of starting an unnecessary second reissue.
    if (
      failedAccessToken &&
      currentAccessToken &&
      failedAccessToken !== currentAccessToken
    ) {
      return retryWithAccessToken(config, currentAccessToken);
    }

    try {
      const newAccessToken = await refreshAccessToken();
      return retryWithAccessToken(config, newAccessToken);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
