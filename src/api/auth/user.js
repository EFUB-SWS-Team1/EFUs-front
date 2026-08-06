import axiosInstance from "../axiosInstance";

export async function getCurrentUser() {
  const response = await axiosInstance.get("/users/me");
  return response.data?.data;
}
