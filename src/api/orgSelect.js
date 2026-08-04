import axiosInstance from "./axiosInstance";

const USE_MOCK = true; 

/** 'empty' | 'with-orgs' */
const MOCK_MODE = "with-orgs";

const MOCK_ORGS = [
  { id: "efub", name: "EFUB", memberCount: 25 },
  { id: "book-club", name: "독서 모임", memberCount: 30 },
  { id: "student-council", name: "학생회", memberCount: 17 },
];

function mapOrg(item) {
  return {
    id: item.id ?? item.organizationId,
    name: item.name,
    memberCount: item.memberCount ?? item.member_count ?? 0,
    // 명세: 현재 기수, 내 역할도 오나?
    currentTerm: item.currentTerm ?? item.activeTerm ?? null,
    role: item.role ?? null,
  };
}

function mapInviteCodes(data) {
  const codes = data.inviteCodes ?? data.invitations ?? data;
  if (Array.isArray(codes)) {
    const staff = codes.find((c) => String(c.role).toUpperCase() === "STAFF");
    const member = codes.find((c) => String(c.role).toUpperCase() === "MEMBER");
    return {
      staff: staff?.code ?? "",
      general: member?.code ?? "",
    };
  }
  return {
    staff: codes.staff ?? codes.staffCode ?? "",
    general: codes.general ?? codes.member ?? codes.memberCode ?? "",
  };
}

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 내 단체 목록 — 빈 배열이면 empty UI */
export async function getMyOrganizations() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_MODE === "empty" ? [] : MOCK_ORGS;
  }

  // GET /api/organizations (Authorization 필요)
  const { data } = await axiosInstance.get("/organizations");
  const list = Array.isArray(data) ? data : data?.content ?? data?.organizations ?? [];
  return list.map(mapOrg);
}

/** 초대 코드로 가입 */
export async function joinOrganizationByCode(code) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!code.trim()) throw new Error("초대 코드를 입력해주세요");
    return { id: "joined-org", name: "새로 참여한 단체", memberCount: 1 };
  }

  // POST /api/invitations/join
  const { data } = await axiosInstance.post("/invitations/join", {
    code: code.trim(),
  });

  return mapOrg(data.organization ?? data);
}

/**
 * 단체 생성
 * 명세 Body: name, initialTermName, initialTermStartDate
 *
 * 지금은 모달이 name만 받음 → 기수 정보는 임시 기본값
 */
export async function createOrganization({
  name,
  initialTermName,
  initialTermStartDate,
}) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    if (!name.trim()) throw new Error("단체명을 입력해주세요");
    return {
      org: { id: "new-org", name: name.trim(), memberCount: 1 },
      inviteCodes: { staff: "AB1C34", general: "F2XC4L" },
    };
  }

  const body = {
    name: name.trim(),
    initialTermName: initialTermName?.trim() || "1기",
    initialTermStartDate: initialTermStartDate || todayDateString(),
  };

  // POST /api/organizations
  const { data } = await axiosInstance.post("/organizations", body);

  return {
    org: mapOrg(data.organization ?? data.org ?? data),
    inviteCodes: mapInviteCodes(data),
  };
}