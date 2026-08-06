import axiosInstance from "../axiosInstance";

const USE_MOCK = false;

export async function closeGeneration(termId, endDate) {
  if (USE_MOCK) {
    return { success: true };
  }

  await axiosInstance.patch(`/terms/${termId}/close`, { endDate });
  return { success: true };
}