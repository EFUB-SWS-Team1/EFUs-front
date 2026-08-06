import axiosInstance from "../axiosInstance";

/**
 * 선택한 기수의 대시보드 데이터를 조회한다.
 * axiosInstance의 baseURL에 /api가 포함되므로 여기서는 /terms부터 요청한다.
 */
export async function getDashboard(termId) {
  const response = await axiosInstance.get(`/terms/${termId}/dashboard`);
  return response.data?.data;
}
