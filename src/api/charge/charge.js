import axiosInstance from "../axiosInstance";

const unwrap = (data) => data?.data ?? data;
const unwrapList = (data, keys = []) => {
  const value = unwrap(data);
  if (Array.isArray(value)) return value;
  for (const key of keys) if (Array.isArray(value?.[key])) return value[key];
  return value?.content ?? [];
};

function mapRole(role) {
  return String(role ?? "").toUpperCase() === "STAFF" ? "staff" : "general";
}

export async function getChargeMembers(termId, params = {}) {
  const { data } = await axiosInstance.get(`/terms/${termId}/members`, {
    params: { keyword: params.keyword, page: params.page, size: params.size ?? 100 },
  });
  return unwrapList(data, ["members"]).map((item) => ({
    id: item.termMemberId ?? item.id,
    name: item.name,
    role: mapRole(item.role),
  }));
}

export async function getChargeFundings(termId) {
  const { data } = await axiosInstance.get(`/terms/${termId}/fundings`);
  return unwrapList(data, ["fundings", "events"]).map((item) => ({
    id: item.fundingId ?? item.id,
    name: item.name ?? item.title,
  }));
}

/** preview, 등록, 미납 청구 수정에서 공통으로 사용하는 금액/대상 명세 */
export function buildChargeAssignment({ chargeMethod, targetMode, targetTermMemberIds, amount }) {
  return {
    chargeMethod,
    targetMode,
    ...(targetMode === "SELECTED" ? { targetTermMemberIds } : {}),
    ...(chargeMethod === "PER_PERSON"
      ? { perPersonAmount: Number(amount) }
      : { totalAmount: Number(amount) }),
  };
}

export async function createCharge(termId, payload) {
  const { data } = await axiosInstance.post(`/terms/${termId}/charges`, payload);
  return unwrap(data);
}

export async function previewCharge(termId, payload) {
  const { data } = await axiosInstance.post(`/terms/${termId}/charges/preview`, payload);
  return unwrap(data);
}

export async function getCharge(chargeId) {
  const { data } = await axiosInstance.get(`/charges/${chargeId}`);
  return unwrap(data);
}

function mapPaymentStatus(status) {
  return ["PAID", "COMPLETED"].includes(String(status ?? "").toUpperCase())
    ? "completed"
    : "pending";
}

export async function getChargePaymentMembers(chargeId, params = {}) {
  const { data } = await axiosInstance.get(`/charges/${chargeId}/members`, { params });
  return unwrapList(data, ["members"]).map((item) => ({
    id: item.chargeMemberId ?? item.id ?? item.termMemberId,
    termMemberId: item.termMemberId ?? item.memberId ?? item.id,
    name: item.name,
    role: mapRole(item.role) === "staff" ? "운영진" : "일반",
    status: mapPaymentStatus(item.paymentStatus ?? item.status),
    amount: item.assignedAmount ?? item.amount ?? item.chargeAmount ?? 0,
    paidAt: item.paidAt ?? null,
  }));
}

export async function updateCharge(chargeId, payload) {
  const { data } = await axiosInstance.patch(`/charges/${chargeId}`, payload);
  return unwrap(data);
}

export async function deleteCharge(chargeId) {
  const { data } = await axiosInstance.delete(`/charges/${chargeId}`);
  return unwrap(data);
}

export async function payChargeMember(chargeId, chargeMemberId, paidAt) {
  const { data } = await axiosInstance.post(
    `/charges/${chargeId}/members/${chargeMemberId}/payment`,
    paidAt ? { paidAt } : {},
  );
  return unwrap(data);
}

export async function reverseChargeMemberPayment(chargeId, chargeMemberId, reason = "잘못된 납부 처리") {
  const { data } = await axiosInstance.post(
    `/charges/${chargeId}/members/${chargeMemberId}/payment/reversal`,
    { reason },
  );
  return unwrap(data);
}

export async function bulkPayCharge(chargeId, payload = { targetMode: "ALL_UNPAID" }) {
  const { data } = await axiosInstance.post(`/charges/${chargeId}/payments/bulk`, payload);
  return unwrap(data);
}

export async function getChargeHistories(chargeId, params = {}) {
  const { data } = await axiosInstance.get(`/charges/${chargeId}/histories`, { params });
  return unwrapList(data, ["histories"]).map((item) => ({
    date: String(item.changedAt ?? item.date ?? "").slice(0, 10).replaceAll("-", "."),
    author: item.actorName ?? item.author ?? "-",
    content: item.summary ?? item.actionType ?? "-",
  }));
}
