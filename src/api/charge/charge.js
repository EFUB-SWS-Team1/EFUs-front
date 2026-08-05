import axiosInstance from "../axiosInstance";

const USE_MOCK = false; // 백엔드/토큰 준비되면 false

const MOCK_MEMBERS = [
  { id: 1, name: "홍길동", role: "staff" },
  { id: 2, name: "김민지", role: "staff" },
  { id: 3, name: "이수진", role: "general" },
  { id: 4, name: "박철수", role: "general" },
  { id: 5, name: "최영희", role: "general" },
  { id: 6, name: "정민호", role: "general" },
  { id: 7, name: "한지우", role: "general" },
  { id: 8, name: "오세훈", role: "general" },
  { id: 9, name: "윤서연", role: "general" },
  { id: 10, name: "강다은", role: "general" },
];

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.members ?? [];
}

function mapRole(role) {
  const value = String(role ?? "").toUpperCase();
  if (value === "STAFF" || value === "운영진") return "staff";
  return "general";
}

function mapMember(item) {
  return {
    id: item.id ?? item.termMemberId,
    name: item.name,
    role: mapRole(item.role),
  };
}

/** 청구 대상 멤버 목록 */
export async function getChargeMembers(termId, params = {}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const keyword = (params.keyword ?? "").trim().toLowerCase();
    return MOCK_MEMBERS.filter((m) =>
      keyword ? m.name.toLowerCase().includes(keyword) : true,
    );
  }

  const { data } = await axiosInstance.get(`/terms/${termId}/members`, {
    params: {
      keyword: params.keyword,
      page: params.page,
      size: params.size ?? 100,
    },
  });

  return unwrapList(data).map(mapMember);
}

/**
 * 회비 청구 등록
 * Body 명세:
 * - title, chargeMethod, dueDate
 * - fundingId?, memo?
 * - targetMode: ALL_ACTIVE | SELECTED
 * - targetTermMemberIds? (SELECTED일 때)
 * - perPersonAmount? (PER_PERSON)
 * - totalAmount? (EQUAL_SPLIT)
 */
export async function createCharge(termId, payload) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return {
      id: Date.now(),
      ...payload,
    };
  }

  const { data } = await axiosInstance.post(
    `/terms/${termId}/charges`,
    payload,
  );
  return data;
}

/** (선택) 금액 미리 계산 */
export async function previewCharge(termId, payload) {
  if (USE_MOCK) {
    const count = payload.targetTermMemberIds?.length ?? 0;
    if (payload.chargeMethod === "PER_PERSON") {
      return {
        requestedAmount: (payload.perPersonAmount ?? 0) * count,
      };
    }
    return { requestedAmount: payload.totalAmount ?? 0 };
  }

  const { data } = await axiosInstance.post(
    `/terms/${termId}/charges/preview`,
    payload,
  );
  return data;
}

function unwrapChargeMembers(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.members ?? [];
}

function mapPaymentStatus(status) {
  const value = String(status ?? "").toUpperCase();
  if (value === "PAID" || value === "COMPLETED" || value === "완료") {
    return "completed";
  }
  return "pending";
}

function mapChargeMember(item) {
  const roleRaw = String(item.role ?? "").toUpperCase();
  return {
    id: item.chargeMemberId ?? item.id ?? item.termMemberId,
    termMemberId: item.termMemberId ?? item.id,
    name: item.name,
    role: roleRaw === "STAFF" || roleRaw === "운영진" ? "운영진" : "일반",
    status: mapPaymentStatus(item.paymentStatus ?? item.status),
    amount: item.assignedAmount ?? item.amount ?? item.chargeAmount ?? 0,
    paidAt: item.paidAt ?? null,
  };
}

/** 회비 청구 상세 */
export async function getCharge(chargeId) {
  if (USE_MOCK) {
    return {
      id: chargeId,
      title: "9월 정기 회비",
      dueDate: "2026-09-09",
      createdAt: "2026-10-17",
      requestedAmount: 500000,
      paidAmount: 0,
      unpaidAmount: 500000,
      paidCount: 0,
      unpaidCount: 6,
      paymentStatus: "UNPAID",
      fundingName: "-",
      memo: null,
      deleted: false,
    };
  }

  const { data } = await axiosInstance.get(`/charges/${chargeId}`);
  return data;
}

/** 청구 대상자·납부 상태 */
export async function getChargePaymentMembers(chargeId, params = {}) {
  if (USE_MOCK) {
    return [
      {
        id: 1,
        name: "홍길동",
        role: "운영진",
        status: "pending",
        amount: 250000,
      },
      {
        id: 2,
        name: "김민지",
        role: "운영진",
        status: "pending",
        amount: 250000,
      },
      {
        id: 3,
        name: "이수진",
        role: "일반",
        status: "pending",
        amount: 250000,
      },
      {
        id: 4,
        name: "박철수",
        role: "일반",
        status: "completed",
        amount: 250000,
      },
      {
        id: 5,
        name: "최영희",
        role: "일반",
        status: "pending",
        amount: 250000,
      },
      {
        id: 6,
        name: "정민호",
        role: "일반",
        status: "pending",
        amount: 250000,
      },
    ];
  }

  const { data } = await axiosInstance.get(`/charges/${chargeId}/members`, {
    params: {
      keyword: params.keyword,
      paymentStatus: params.paymentStatus,
      page: params.page,
      size: params.size,
    },
  });

  return unwrapChargeMembers(data).map(mapChargeMember);
}

/** 회비 청구 삭제(소프트) */
export async function deleteCharge(chargeId) {
  if (USE_MOCK) return { success: true };
  await axiosInstance.delete(`/charges/${chargeId}`);
  return { success: true };
}

/** 개별 납부 처리 */
export async function payChargeMember(chargeId, chargeMemberId, paidAt) {
  if (USE_MOCK) return { success: true };
  const { data } = await axiosInstance.post(
    `/charges/${chargeId}/members/${chargeMemberId}/payment`,
    paidAt ? { paidAt } : {},
  );
  return data;
}

/** 납부 취소 */
export async function reverseChargeMemberPayment(
  chargeId,
  chargeMemberId,
  reason = "잘못된 납부 처리",
) {
  if (USE_MOCK) return { success: true };
  const { data } = await axiosInstance.post(
    `/charges/${chargeId}/members/${chargeMemberId}/payment/reversal`,
    { reason },
  );
  return data;
}

/** 일괄 납부 처리 */
export async function bulkPayCharge(
  chargeId,
  payload = { targetMode: "ALL_UNPAID" },
) {
  if (USE_MOCK) return { success: true };
  const { data } = await axiosInstance.post(
    `/charges/${chargeId}/payments/bulk`,
    payload,
  );
  return data;
}

/** 회비 이력 */
export async function getChargeHistories(chargeId, params = {}) {
  if (USE_MOCK) {
    return [{ date: "2026.10.17", author: "홍길동", content: "생성" }];
  }

  const { data } = await axiosInstance.get(`/charges/${chargeId}/histories`, {
    params: { page: params.page, size: params.size },
  });

  const list = Array.isArray(data)
    ? data
    : (data?.content ?? data?.histories ?? []);
  return list.map((item) => ({
    date: String(item.changedAt ?? item.date ?? "")
      .slice(0, 10)
      .replaceAll("-", "."),
    author: item.actorName ?? item.author ?? "-",
    content: item.summary ?? item.actionType ?? "-",
  }));
}
