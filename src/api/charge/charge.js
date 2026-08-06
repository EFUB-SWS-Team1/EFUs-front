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
  const result = await getChargePaymentMembersPage(chargeId, params);
  return result.members;
}

export async function getChargePaymentMembersPage(chargeId, params = {}) {
  const query = {
    ...(params.keyword?.trim() ? { keyword: params.keyword.trim() } : {}),
    ...(params.paymentStatus ? { paymentStatus: params.paymentStatus } : {}),
    page: params.page ?? 0,
    size: params.size ?? 100,
  };
  const { data } = await axiosInstance.get(`/charges/${chargeId}/members`, {
    params: query,
  });
  const payload = unwrap(data);
  const items = unwrapList(data, ["members"]);
  const members = items.map((item) => ({
    id: item.chargeMemberId,
    chargeMemberId: item.chargeMemberId,
    termMemberId: item.termMemberId,
    name: item.name,
    role: mapRole(item.role) === "staff" ? "운영진" : "일반",
    status: mapPaymentStatus(item.paymentStatus ?? item.status),
    paymentStatus: item.paymentStatus,
    assignedAmount: item.assignedAmount ?? 0,
    amount: item.assignedAmount ?? 0,
    paidAt: item.paidAt ?? null,
  }));

  return {
    members,
    page: payload?.number ?? payload?.page ?? payload?.pageInfo?.page ?? query.page,
    size: payload?.size ?? payload?.pageInfo?.size ?? query.size,
    totalPages:
      payload?.totalPages ?? payload?.pageInfo?.totalPages ?? (members.length ? 1 : 0),
    totalElements:
      payload?.totalElements ?? payload?.pageInfo?.totalElements ?? members.length,
  };
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
    paidAt ? { paidAt } : undefined,
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
  return unwrapList(data, ["histories"])
    .filter((item) => {
      const action = String(
        item.actionType ?? item.type ?? item.httpMethod ?? item.method ?? "",
      ).toUpperCase();
      const summary = String(
        item.summary ?? item.changeSummary ?? item.description ?? "",
      ).toUpperCase();
      const historyText = `${action} ${summary}`;

      if (/PAYMENT|PAID|UNPAID|REVERSAL|납부|미납/.test(historyText)) return false;
      if (/CREATE|CREATED|DELETE|DELETED|생성|등록|삭제/.test(historyText)) return false;

      return (
        /PATCH|UPDATE|UPDATED|EDIT|EDITED|MODIFY|MODIFIED|수정|변경/.test(historyText) ||
        Array.isArray(item.changedFields) ||
        item.changes != null
      );
    })
    .map((item) => ({
      content:
        item.summary ??
        item.changeSummary ??
        item.description ??
        item.changedContent ??
        item.actionType ??
        "-",
      author:
        item.actorName ??
        item.updatedByName ??
        item.modifiedByName ??
        item.author ??
        "-",
      date: String(
        item.changedAt ?? item.updatedAt ?? item.modifiedAt ?? item.date ?? "",
      ).slice(0, 16).replace("T", " ").replaceAll("-", "."),
    }));
}
