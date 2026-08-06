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
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!config || response?.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const newAccessToken = await reissue();
        onTokenRefreshed(newAccessToken);
        isRefreshing = false;

        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(config);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(err);
      }
    }

    return new Promise((resolve) => {
      addRefreshSubscriber((token) => {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
        resolve(axiosInstance(config));
      });
    });
  },
);

export default axiosInstance;