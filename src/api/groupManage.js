import axiosInstance from "./axiosInstance";

/**
 * groupManage.js
 *
 * USE_MOCK = true  → mock
 * USE_MOCK = false → 실제 API
 */

const USE_MOCK = false;

const MOCK_DATA = {
  "efub-6": {
    generation: {
      id: 6,
      label: "6기",
      startDate: "2026-03-03",
      endDate: null,
      isActive: true,
    },
    currentUser: {
      id: 2,
      role: "staff",
    },
    inviteCodes: {
      staff: "AB1C34",
      general: "F2XC4L",
      expiresInDays: 7,
    },
    members: [
      { id: 1, name: "홍길동", role: "staff", email: "hong@email.com" },
      { id: 2, name: "김민지", role: "staff", email: "kimminji@email.com" },
      { id: 3, name: "홍길동", role: "staff", email: "hong2@email.com" },
      { id: 4, name: "홍길동", role: "general", email: "hong3@email.com" },
      { id: 5, name: "홍길동", role: "general", email: "hong4@email.com" },
      { id: 6, name: "홍길동", role: "general", email: "hong5@email.com" },
      { id: 7, name: "홍길동", role: "general", email: "hong6@email.com" },
      { id: 8, name: "이수진", role: "general", email: "lee@email.com" },
      { id: 9, name: "박철수", role: "general", email: "park@email.com" },
      { id: 10, name: "최영희", role: "general", email: "choi@email.com" },
      { id: 11, name: "정민호", role: "general", email: "jung@email.com" },
      { id: 12, name: "한지우", role: "general", email: "han@email.com" },
      { id: 13, name: "오세훈", role: "general", email: "oh@email.com" },
      { id: 14, name: "윤서연", role: "general", email: "yoon@email.com" },
      { id: 15, name: "강다은", role: "general", email: "kang@email.com" },
      { id: 16, name: "임재현", role: "general", email: "lim@email.com" },
      { id: 17, name: "송하늘", role: "general", email: "song@email.com" },
      { id: 18, name: "류민석", role: "general", email: "ryu@email.com" },
      { id: 19, name: "조은별", role: "general", email: "jo@email.com" },
      { id: 20, name: "신유나", role: "general", email: "shin@email.com" },
    ],
    memberDetails: {
      2: {
        paidTotal: 15000,
        unpaidTotal: 10000,
        dues: [
          {
            id: 1,
            label: "5월 회비",
            amount: 10000,
            dueDate: "05.07",
            status: "unpaid",
          },
          {
            id: 2,
            label: "4월 회비",
            amount: 5000,
            dueDate: "04.09",
            status: "paid",
          },
          {
            id: 3,
            label: "3월 회비",
            amount: 10000,
            dueDate: "03.05",
            status: "paid",
          },
        ],
      },
    },
  },
};

function getMockStore(termId) {
  return MOCK_DATA[termId] ?? MOCK_DATA["efub-6"];
}

/** STAFF/MEMBER → staff/general */
function mapRole(role) {
  const value = String(role ?? "").toUpperCase();
  if (value === "STAFF") return "staff";
  return "general";
}

function mapMember(item) {
  return {
    id: item.id ?? item.termMemberId,
    name: item.name,
    role: mapRole(item.role),
    email: item.email ?? "",
    profileImageUrl: item.profileImageUrl ?? item.kakaoProfileImageUrl ?? null,
  };
}

function mapGeneration(term) {
  return {
    id: term.id ?? term.termId,
    label: term.label ?? term.name ?? "",
    startDate: term.startDate,
    endDate: term.endDate ?? null,
    isActive: term.isActive ?? term.endDate == null,
  };
}

function daysUntil(dateStr) {
  if (!dateStr) return 7;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function mapInviteCodes(data) {
  // 응답이 배열인 경우: [{ role, code, expiresAt }, ...]
  if (Array.isArray(data)) {
    const staff = data.find(
      (item) => String(item.role).toUpperCase() === "STAFF",
    );
    const member = data.find(
      (item) => String(item.role).toUpperCase() === "MEMBER",
    );
    const expiresAt = staff?.expiresAt ?? member?.expiresAt ?? staff?.expiredAt;
    return {
      staff: staff?.code ?? "",
      general: member?.code ?? "",
      expiresInDays: daysUntil(expiresAt),
    };
  }

  // 응답이 객체인 경우아님말고
  return {
    staff: data.staffCode ?? data.staff ?? data.STAFF ?? "",
    general:
      data.memberCode ?? data.general ?? data.MEMBER ?? data.member ?? "",
    expiresInDays:
      data.expiresInDays ?? daysUntil(data.expiresAt ?? data.expiredAt),
  };
}

function mapPaymentStatus(status) {
  const value = String(status ?? "").toLowerCase();
  if (value.includes("paid") && !value.includes("un")) return "paid";
  if (value === "납부" || value === "완료") return "paid";
  return "unpaid";
}

function mapDue(item) {
  return {
    id: item.id ?? item.chargeId,
    label: item.label ?? item.title ?? item.name ?? "",
    amount: item.amount ?? item.perPersonAmount ?? item.chargeAmount ?? 0,
    dueDate: item.dueDate ?? "",
    status: mapPaymentStatus(item.status ?? item.paymentStatus),
  };
}

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.members ?? data?.charges ?? [];
}

export async function getGroupManageOverview(termId) {
  if (USE_MOCK) {
    const data = getMockStore(termId);
    return {
      generation: data.generation,
      currentUser: data.currentUser,
      members: data.members,
      totalCount: data.members.length,
    };
  }

  const [termRes, membersRes] = await Promise.all([
    axiosInstance.get(`/terms/${termId}`),
    axiosInstance.get(`/terms/${termId}/members`),
  ]);

  const members = unwrapList(membersRes.data).map(mapMember);

  // TODO: 로그인 유저의 기수 역할 API 연결 후 교체
  // 응답에 isMe 같은 필드가 있으면 그걸 사용
  const me = unwrapList(membersRes.data).find((item) => item.isMe || item.me);
  const currentUser = me
    ? { id: me.id ?? me.termMemberId, role: mapRole(me.role) }
    : { id: null, role: "general" };

  return {
    generation: mapGeneration(termRes.data),
    currentUser,
    members,
    totalCount: membersRes.data?.totalElements ?? members.length,
  };
}

export async function getInviteCodes(termId) {
  if (USE_MOCK) {
    return getMockStore(termId).inviteCodes;
  }

  const { data } = await axiosInstance.get(`/terms/${termId}/invitations`);
  return mapInviteCodes(data);
}

export async function getMemberDetail(termId, termMemberId) {
  if (USE_MOCK) {
    const data = getMockStore(termId);
    const member = data.members.find((m) => m.id === Number(termMemberId));
    if (!member) throw new Error("멤버를 찾을 수 없습니다.");

    const detail = data.memberDetails[termMemberId] ?? {
      paidTotal: 0,
      unpaidTotal: 0,
      dues: [],
    };

    return { member, ...detail };
  }

  // 명세: 청구 완료 후 구현
  const [memberRes, chargesRes] = await Promise.all([
    axiosInstance.get(`/terms/${termId}/members/${termMemberId}`),
    axiosInstance.get(`/terms/${termId}/members/${termMemberId}/charges`),
  ]);

  const memberData = memberRes.data;

  return {
    member: mapMember(memberData),
    paidTotal: memberData.paidTotal ?? memberData.totalPaidAmount ?? 0,
    unpaidTotal: memberData.unpaidTotal ?? memberData.totalUnpaidAmount ?? 0,
    dues: unwrapList(chargesRes.data).map(mapDue),
  };
}

export async function closeGeneration(termId, endDate) {
  if (USE_MOCK) {
    const data = getMockStore(termId);
    data.generation.endDate = endDate;
    data.generation.isActive = false;
    return { success: true };
  }

  await axiosInstance.patch(`/terms/${termId}/close`, { endDate });
  return { success: true };
}
