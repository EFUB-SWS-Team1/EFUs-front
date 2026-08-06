import axiosInstance from "../axiosInstance";

function unwrapPayload(response) {
  return response.data?.data;
}

function unwrapPage(payload, keys) {
  const content = Array.isArray(payload)
    ? payload
    : keys.reduce((result, key) => result ?? payload?.[key], null) ??
      payload?.content ??
      [];

  return {
    content,
    page: payload?.page ?? payload?.number ?? payload?.pageInfo?.page ?? 0,
    size: payload?.size ?? payload?.pageInfo?.size ?? content.length,
    totalElements:
      payload?.totalElements ?? payload?.pageInfo?.totalElements ?? content.length,
    totalPages:
      payload?.totalPages ?? payload?.pageInfo?.totalPages ?? (content.length ? 1 : 0),
  };
}

function mapRole(role) {
  return String(role).toUpperCase() === "STAFF" ? "staff" : "general";
}

function mapMember(item) {
  return {
    termMemberId: item.termMemberId,
    name: item.name,
    role: mapRole(item.role),
    email: item.email ?? "",
    profileImageUrl: item.profileImageUrl ?? null,
  };
}

function mapCharge(item) {
  return {
    id: item.chargeId,
    label: item.title ?? item.name ?? item.chargeName ?? "-",
    amount:
      item.assignedAmount ?? item.amount ?? item.individualAmount ?? 0,
    dueDate: item.dueDate,
    status: String(item.paymentStatus).toLowerCase(),
  };
}

export async function getMembers(termId, { keyword, role, page = 0, size = 7 } = {}) {
  const response = await axiosInstance.get(`/terms/${termId}/members`, {
    params: {
      ...(keyword ? { keyword } : {}),
      ...(role ? { role } : {}),
      page,
      size,
    },
  });
  const result = unwrapPage(unwrapPayload(response), ["members"]);
  return { ...result, content: result.content.map(mapMember) };
}

export async function getMemberDetail(termId, termMemberId) {
  const response = await axiosInstance.get(
    `/terms/${termId}/members/${termMemberId}`,
  );
  const data = unwrapPayload(response);
  return {
    member: mapMember(data),
    paidTotal: data.paidAmount ?? data.totalPaidAmount ?? data.paidTotal ?? 0,
    unpaidTotal:
      data.unpaidAmount ?? data.totalUnpaidAmount ?? data.unpaidTotal ?? 0,
  };
}

export async function getMemberCharges(
  termId,
  termMemberId,
  { paymentStatus, page = 0, size = 7 } = {},
) {
  const response = await axiosInstance.get(
    `/terms/${termId}/members/${termMemberId}/charges`,
    {
      params: {
        ...(paymentStatus ? { paymentStatus } : {}),
        page,
        size,
      },
    },
  );
  const result = unwrapPage(unwrapPayload(response), ["charges"]);
  return { ...result, content: result.content.map(mapCharge) };
}
