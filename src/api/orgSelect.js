

const USE_MOCK = true;

/**'empty' | 'with-orgs' 로 화면 전환 테스트 */
const MOCK_MODE = "with-orgs";

const MOCK_ORGS = [
  { id: "efub", name: "EFUB", memberCount: 25 },
  { id: "book-club", name: "독서 모임", memberCount: 30 },
  { id: "student-council", name: "학생회", memberCount: 17 },
];

export async function getMyOrganizations() {
  if (!USE_MOCK) {
    const res = await fetch("/api/me/organizations");
    if (!res.ok) throw new Error("단체 목록 조회 실패");
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 300));
  return MOCK_MODE === "empty" ? [] : MOCK_ORGS;
}

export async function joinOrganizationByCode(code) {
  if (!USE_MOCK) {
    const res = await fetch("/api/organizations/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) throw new Error("초대 코드가 유효하지 않습니다");
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 300));
  if (!code.trim()) throw new Error("초대 코드를 입력해주세요");
  return { id: "joined-org", name: "새로 참여한 단체", memberCount: 1 };
}

export async function createOrganization({ name }) {
  if (!USE_MOCK) {
    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("단체 생성 실패");
    return res.json();
  }

  await new Promise((r) => setTimeout(r, 300));
  if (!name.trim()) throw new Error("단체명을 입력해주세요");

  return {
    org: {
      id: "new-org",
      name: name.trim(),
      memberCount: 1,
    },
    inviteCodes: {
      staff: "AB1C34",
      general: "F2XC4L",
    },
  };
}
