import axiosInstance from "../axiosInstance";

export async function getOrganizationTerms(organizationId) {
  const response = await axiosInstance.get(
    `/organizations/${organizationId}/terms`,
  );
  const payload = response.data?.data;
  return Array.isArray(payload) ? payload : payload?.content ?? payload?.terms ?? [];
}

export async function getTerm(termId) {
  const response = await axiosInstance.get(`/terms/${termId}`);
  return response.data?.data;
}

export async function closeGeneration(termId, endDate) {
  await axiosInstance.patch(`/terms/${termId}/close`, { endDate });
  return { success: true };
}
