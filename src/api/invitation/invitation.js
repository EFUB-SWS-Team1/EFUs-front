import axiosInstance from "../axiosInstance";

function unwrapPayload(response) {
  return response.data?.data;
}

function daysUntil(dateString) {
  if (!dateString) return null;
  return Math.max(
    0,
    Math.ceil((new Date(dateString).getTime() - Date.now()) / 86_400_000),
  );
}

function mapInviteCodes(data) {
  const invitations = Array.isArray(data) ? data : data?.invitations ?? [];
  const staff = invitations.find((item) => item.role === "STAFF");
  const member = invitations.find((item) => item.role === "MEMBER");
  const expiresAt = staff?.expiresAt ?? member?.expiresAt ?? null;
  return {
    staff: staff?.code ?? data?.staffCode ?? "",
    general: member?.code ?? data?.memberCode ?? "",
    expiresAt,
    expiresInDays: daysUntil(expiresAt),
  };
}

export async function getInviteCodes(termId) {
  const response = await axiosInstance.get(`/terms/${termId}/invitations`);
  return mapInviteCodes(unwrapPayload(response));
}

export async function reissueInviteCode(termId, role) {
  const response = await axiosInstance.post(`/terms/${termId}/invitations`, {
    role,
  });
  return unwrapPayload(response);
}

export async function validateInvitation(code) {
  const response = await axiosInstance.post("/invitations/validate", {
    code: code.trim(),
  });
  return unwrapPayload(response);
}

export async function joinOrganizationByCode(code) {
  const response = await axiosInstance.post("/invitations/join", {
    code: code.trim(),
  });
  return unwrapPayload(response);
}
