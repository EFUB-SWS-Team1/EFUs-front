import axiosInstance from "../axiosInstance";

const USE_MOCK = true;

const MOCK_ORGS_JOIN = {
  id: "joined-org",
  name: "새로 참여한 단체",
  memberCount: 1,
};

const MOCK_INVITE_CODES = {
  staff: "AB1C34",
  general: "F2XC4L",
  expiresInDays: 7,
};

function mapOrg(item) {
  return {
    id: item.id ?? item.organizationId,
    name: item.name,
    memberCount: item.memberCount ?? item.member_count ?? 0,
    currentTerm: item.currentTerm ?? item.activeTerm ?? null,
    role: item.role ?? null,
  };
}

function daysUntil(dateStr) {
  if (!dateStr) return 7;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function mapInviteCodes(data) {
  if (Array.isArray(data)) {
    const staff = data.find((item) => String(item.role).toUpperCase() === "STAFF");
    const member = data.find((item) => String(item.role).toUpperCase() === "MEMBER");
    const expiresAt = staff?.expiresAt ?? member?.expiresAt ?? staff?.expiredAt;
    return {
      staff: staff?.code ?? "",
      general: member?.code ?? "",
      expiresInDays: daysUntil(expiresAt),
    };
  }

  return {
    staff: data.staffCode ?? data.staff ?? data.STAFF ?? "",
    general: data.memberCode ?? data.general ?? data.MEMBER ?? data.member ?? "",
    expiresInDays: data.expiresInDays ?? daysUntil(data.expiresAt ?? data.expiredAt),
  };
}

/** 초대 코드로 가입 (옛 orgSelect) */
export async function joinOrganizationByCode(code) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!code.trim()) throw new Error("초대 코드를 입력해주세요");
    return MOCK_ORGS_JOIN;
  }

  const { data } = await axiosInstance.post("/invitations/join", {
    code: code.trim(),
  });

  return mapOrg(data.organization ?? data);
}

/** 기수 초대 코드 조회 (옛 groupManage) */
export async function getInviteCodes(termId) {
  if (USE_MOCK) {
    return MOCK_INVITE_CODES;
  }

  const { data } = await axiosInstance.get(`/terms/${termId}/invitations`);
  return mapInviteCodes(data);
}