import axiosInstance from "../axiosInstance";

const USE_MOCK = false;

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

export async function getMyOrganizations() {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    return MOCK_MODE === "empty" ? [] : MOCK_ORGS;
  }

  const { data } = await axiosInstance.get("/organizations");
  const list = Array.isArray(data) ? data : data?.content ?? data?.organizations ?? [];
  return list.map(mapOrg);
}

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

  const { data } = await axiosInstance.post("/organizations", body);

  return {
    org: mapOrg(data.organization ?? data.org ?? data),
    inviteCodes: mapInviteCodes(data),
  };
}